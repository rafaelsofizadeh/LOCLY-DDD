import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import config from '../../../../app.configuration';

import {
  PayShipmentPayload,
  IPayShipment,
  PayShipmentResult,
} from './IPayShipment';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ClientSession } from 'mongodb';
import {
  StripeCheckoutSession,
  StripePrice,
  stripePrice,
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { Cost, OrderStatus } from '../../entity/Order';
import { FeeType } from '../StripeCheckoutWebhook/IStripeCheckoutWebhook';
import { Customer } from '../../../customer/entity/Customer';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { Host } from '../../../host/entity/Host';

@Injectable()
export class PayShipmentService implements IPayShipment {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly hostRepository: IHostRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  @Transaction
  async execute({
    port: payShipmentPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<PayShipmentPayload>): Promise<PayShipmentResult> {
    const checkoutSession: Stripe.Checkout.Session = await this.createPaymentSession(
      payShipmentPayload,
      mongoTransactionSession,
    );

    return {
      checkoutUrl: checkoutSession.url,
    };
  }

  // TODO: Error handling and rejection events
  private async createPaymentSession(
    { orderId, customerId }: PayShipmentPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const {
      finalShipmentCost: finalShipmentCostPreFee,
      hostId,
    } = await this.orderRepository.findOrder(
      { orderId, status: OrderStatus.Finalized, customerId },
      mongoTransactionSession,
    );

    const finalShipmentCost: Cost = {
      ...finalShipmentCostPreFee,
      // Account for Stripe fee in the final shipment cost.
      amount:
        Math.ceil(finalShipmentCostPreFee.amount / ((100 - 2.9) / 100)) + 0.3,
    };

    const {
      stripeCustomerId,
    }: Customer = await this.customerRepository.findCustomer({ customerId });

    const {
      stripeAccountId: hostStripeAccountId,
    }: Host = await this.hostRepository.findHost({
      hostId,
    });

    const finalShipmentCostStripe: StripePrice = stripePrice(finalShipmentCost);
    const stripeApplicationFeeAmount =
      finalShipmentCostStripe.unit_amount -
      stripePrice(finalShipmentCostPreFee).unit_amount;

    const checkoutSession = (await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            ...finalShipmentCostStripe,
            product_data: {
              name: 'Order Shipment Fee',
            },
          },
          quantity: 1,
        },
      ],
      // Don't allow promo codes on shipment payments
      allow_promotion_codes: false,
      payment_intent_data: {
        application_fee_amount: stripeApplicationFeeAmount,
        transfer_data: { destination: hostStripeAccountId },
      },
      metadata: {
        feeType: FeeType.Shipment,
        orderId,
      },
      mode: 'payment',
      success_url: config.stripe.successPageUrl,
      cancel_url: config.stripe.cancelPageUrl,
    })) as Stripe.Response<StripeCheckoutSession>;

    return checkoutSession;
  }
}
