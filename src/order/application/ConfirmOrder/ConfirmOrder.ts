import Stripe from 'stripe';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import { ConfirmOrderResult, IConfirmOrder } from './IConfirmOrder';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { Host } from '../../../host/entity/Host';
import { UUID } from '../../../common/domain';
import { ClientSession } from 'mongodb';
import {
  StripeCheckoutSession,
  StripePrice,
  stripePrice,
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { OrderStatus, DraftedOrder, Cost } from '../../entity/Order';
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
      checkoutId: checkoutSession.id,
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

    const hostId: UUID = await this.findMatchingHost(
      draftOrder,
      mongoTransactionSession,
    );

    const {
      stripeCustomerId,
    }: Customer = await this.customerRepository.findCustomer({ customerId });

    const checkoutSession: StripeCheckoutSession = await this.createStripeCheckoutSession(
      draftOrder,
      hostId,
      stripeCustomerId,
    );

    return checkoutSession;
  }

  private async findMatchingHost(
    { originCountry }: DraftedOrder,
    mongoTransactionSession: ClientSession,
  ): Promise<UUID> {
    try {
      const matchedHost: Host = await this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
        originCountry,
        mongoTransactionSession,
      );

      return matchedHost.id;
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
    hostId: UUID,
    stripeCustomerId: Stripe.Customer['id'],
  ): Promise<StripeCheckoutSession> {
    const loclyFee: Cost = await this.calculateLoclyFee();
    const price: StripePrice = stripePrice(loclyFee);
    const match: Match = {
      orderId,
      hostId,
    };

    // Edge case: the matched host sets availability to "not available" inbetween the customer confirming the order and paying.
    const checkoutSession = (await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            ...price,
            product_data: {
              name: 'Locly and Host Service Fee',
            },
          },
          quantity: 1,
        },
      ],
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

  private async calculateLoclyFee(): Promise<Cost> {
    return {
      currency: 'USD',
      amount: 100,
    };
  }
}
