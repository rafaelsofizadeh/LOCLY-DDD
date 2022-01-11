import Stripe from 'stripe';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import mainConfig from '../../../../main.configuration';
import appConfig from '../../../../app.configuration';

import { ConfirmOrderResult, IConfirmOrder } from './IConfirmOrder';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { Host } from '../../../host/entity/Host';
import { UUID } from '../../../common/domain';
import { ClientSession } from 'mongodb';
import {
  StripeCheckoutSession,
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { OrderStatus, DraftedOrder } from '../../entity/Order';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { throwCustomException } from '../../../common/error-handling';
import { FeeType } from '../StripeCheckoutWebhook/IStripeCheckoutWebhook';
import { ConfirmOrderPayload } from './IConfirmOrder';
import { Customer } from '../../../customer/entity/Customer';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

export type Match = {
  orderId: UUID;
  hostId: UUID;
};

@Injectable()
export class ConfirmOrder implements IConfirmOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly hostRepository: IHostRepository,
    private readonly customerRepository: ICustomerRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  @Transaction
  async execute({
    port: confirmOrderPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<ConfirmOrderPayload>): Promise<ConfirmOrderResult> {
    const checkoutSession: Stripe.Checkout.Session = await this.matchOrderAndCheckout(
      confirmOrderPayload,
      mongoTransactionSession,
    );

    return {
      checkoutUrl: checkoutSession.url,
    };
  }

  private async matchOrderAndCheckout(
    { orderId, customerId }: ConfirmOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const draftOrder = (await this.orderRepository.findOrder(
      { orderId, status: OrderStatus.Drafted, customerId },
      mongoTransactionSession,
    )) as DraftedOrder;

    const host: Host = await this.findMatchingHost(
      draftOrder,
      mongoTransactionSession,
    );

    const {
      stripeCustomerId,
    }: Customer = await this.customerRepository.findCustomer({ customerId });

    const checkoutSession: StripeCheckoutSession = await this.createStripeCheckoutSession(
      draftOrder,
      host,
      stripeCustomerId,
    );

    return checkoutSession;
  }

  private async findMatchingHost(
    { originCountry }: DraftedOrder,
    mongoTransactionSession: ClientSession,
  ): Promise<Host> {
    try {
      return this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
        originCountry,
        mongoTransactionSession,
      );
    } catch (error) {
      console.error(error);

      throwCustomException(
        'No available host',
        { originCountry },
        HttpStatus.SERVICE_UNAVAILABLE,
      )();
    }
  }

  // TODO: Error handling and rejection events
  private async createStripeCheckoutSession(
    { id: orderId }: DraftedOrder,
    host: Host,
    stripeCustomerId: Stripe.Customer['id'],
  ): Promise<StripeCheckoutSession> {
    const priceId: string = this.configService.get('LOCLY_FEE_PRICE_ID');
    const { loclyFee } = await this.calculateLoclyCut(priceId);

    const match: Match = {
      orderId,
      hostId: host.id,
    };

    // Edge case: the matched host sets availability to "not available" inbetween the customer confirming the order and paying.
    const checkoutSession = (await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      payment_intent_data: {
        application_fee_amount: loclyFee.unit_amount,
        transfer_data: { destination: host.stripeAccountId },
      },
      metadata: {
        feeType: FeeType.Service,
        ...match,
      },
      mode: 'payment',
      success_url: 'https://news.ycombinator.com',
      cancel_url: 'https://reddit.com',
    })) as Stripe.Response<StripeCheckoutSession>;

    return checkoutSession;
  }

  async calculateLoclyCut(totalPriceId: Stripe.Price['id']) {
    const {
      currency,
      unit_amount,
    }: Stripe.Price = await this.stripe.prices.retrieve(totalPriceId);

    const percentage =
      0.01 *
      Number(this.configService.get<number>('LOCLY_SERVICE_FEE_CUT_PERCENT'));

    return {
      total: { currency, unit_amount },
      loclyFee: {
        currency,
        unit_amount: unit_amount * percentage,
      },
    };
  }
}
