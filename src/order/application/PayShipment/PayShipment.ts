import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import {
  PayShipmentPayload,
  IPayShipment,
  PayShipmentResult,
} from './IPayShipment';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import {
  StripeCheckoutSession,
  StripePrice,
  stripePrice,
  withTransaction,
} from '../../../common/application';
import { OrderStatus } from '../../entity/Order';
import { FeeType } from '../StripeCheckoutWebhook/IStripeCheckoutWebhook';
import { Customer } from '../../../customer/entity/Customer';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

@Injectable()
export class PayShipmentService implements IPayShipment {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly customerRepository: ICustomerRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    payShipmentPayload: PayShipmentPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<PayShipmentResult> {
    const checkoutSession: Stripe.Checkout.Session = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.createPaymentSession(payShipmentPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return {
      checkoutId: checkoutSession.id,
    };
  }

  // TODO: Error handling and rejection events
  private async createPaymentSession(
    { orderId, customerId }: PayShipmentPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const { finalShipmentCost } = await this.orderRepository.findOrder(
      { orderId, status: OrderStatus.Finalized, customerId },
      mongoTransactionSession,
    );

    const {
      stripeCustomerId,
    }: Customer = await this.customerRepository.findCustomer({ customerId });

    const price: StripePrice = stripePrice(finalShipmentCost);

    const checkoutSession = (await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            ...price,
            product_data: {
              name: 'Order Shipment Fee',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        feeType: FeeType.Shipment,
        orderId,
      },
      mode: 'payment',
      success_url: 'https://news.ycombinator.com',
      cancel_url: 'https://reddit.com',
    })) as Stripe.Response<StripeCheckoutSession>;

    return checkoutSession;
  }
}
