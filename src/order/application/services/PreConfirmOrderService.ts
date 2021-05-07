import Stripe from 'stripe';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import {
  PreConfirmOrderRequest,
  StripeCheckoutSessionResult,
  PreConfirmOrderUseCase,
} from '../../domain/use-case/PreConfirmOrderUseCase';
import { OrderRepository } from '../port/OrderRepository';
import { Host } from '../../domain/entity/Host';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import { OrderStatus, DraftedOrder, Cost } from '../../domain/entity/Order';
import { HostRepository } from '../port/HostRepository';
import { throwCustomException } from '../../../common/error-handling';

type StripeCheckoutSession = Stripe.Checkout.Session;
type StripePrice = Pick<
  Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
  'currency' | 'unit_amount'
>;

export type Match = {
  orderId: UUID;
  hostId: UUID;
};

@Injectable()
export class PreConfirmOrderService implements PreConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    preConfirmOrderRequest: PreConfirmOrderRequest,
    session?: ClientSession,
  ): Promise<StripeCheckoutSessionResult> {
    // TODO(GLOBAL): Transaction decorator
    const checkoutSession: Stripe.Checkout.Session = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.matchOrderAndCheckout(
          preConfirmOrderRequest,
          sessionWithTransaction,
        ),
      this.mongoClient,
      session,
    );

    return {
      checkoutId: checkoutSession.id,
    };
  }

  // TODO: Error handling and rejection events
  private async matchOrderAndCheckout(
    { orderId, customerId }: PreConfirmOrderRequest,
    session: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const draftOrder = (await this.orderRepository.findOrder(
      { orderId, status: OrderStatus.Drafted, customerId },
      session,
    )) as DraftedOrder;

    const hostId: UUID = await this.findMatchingHost(draftOrder, session);

    const checkoutSession: StripeCheckoutSession = await this.createStripeCheckoutSession(
      draftOrder,
      hostId,
    );

    return checkoutSession;
  }

  private async findMatchingHost(
    { originCountry }: DraftedOrder,
    session: ClientSession,
  ): Promise<UUID> {
    try {
      const matchedHost: Host = await this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
        originCountry,
        session,
      );

      return matchedHost.id;
    } catch (error) {
      throwCustomException(
        'No available host',
        { originCountry },
        HttpStatus.SERVICE_UNAVAILABLE,
      )();
    }
  }

  private async createStripeCheckoutSession(
    draftOrder: DraftedOrder,
    hostId: UUID,
  ): Promise<StripeCheckoutSession> {
    const Cost: Cost = await this.calculateCost();
    const stripePrice: StripePrice = this.stripePrice(Cost);
    const match: Match = {
      orderId: draftOrder.id,
      hostId,
    };

    /**
     * Scenarios:
     *
     * I. Match Order with Host, store hostId on Order BEFORE Payment:
     *
     * 1. Host matched to Order -> Customer didn't finalize Payment -> Customer requests Order info,
     *    sees Order.Host(Id), requests Host info -> gets Host address without Paying.
     * 2. CURRENT:  Host matched to Order -> while Customer finalizes Payment, Host decides to set their status to
     *    "unavailable" -> Customer payed, but Order couldn't be matched to/executed by Host
     *    TODO: Potential solution: prohibit Host from setting status as "unavailable" while the Host has unfinalized
     *    Orders. I.e. "book" the host while the payment is being processed.
     *
     * II. Payment BEFORE matching Host:
     *
     * 1. Customer pays Order -> Order tries to match with a Host -> no Host available
     */
    const checkoutSession: StripeCheckoutSession = await this.stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        customer_email: 'rafa.sofizadeh@gmail.com',
        line_items: [
          {
            price_data: {
              ...stripePrice,
              product_data: {
                name: 'Locly and Host Service Fee',
              },
            },
            quantity: 1,
          },
        ],
        metadata: match,
        mode: 'payment',
        success_url: 'https://news.ycombinator.com',
        cancel_url: 'https://reddit.com',
      },
    );

    return checkoutSession;
  }

  private stripePrice(Cost: Cost) {
    return {
      currency: Cost.currency,
      unit_amount: Math.floor(Cost.amount * 100),
    };
  }

  private async calculateCost(): Promise<Cost> {
    return {
      currency: 'USD',
      amount: 100,
    };
  }
}
