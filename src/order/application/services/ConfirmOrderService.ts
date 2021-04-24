import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import {
  ConfirmOrderRequest,
  StripeCheckoutSessionResult,
  ConfirmOrderUseCase,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { OrderRepository } from '../port/OrderRepository';
import { Host } from '../../domain/entity/Host';
import { MatchRecorder } from '../port/MatchRecorder';
import { UUID } from '../../../common/domain/UUID';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/utils';
import { DraftedOrder, ServiceFee } from '../../domain/entity/DraftedOrder';
import { HostRepository } from '../port/HostRepository';

type StripeCheckoutSession = Stripe.Checkout.Session;
type MatchReference = StripeCheckoutSession['client_reference_id'];

@Injectable()
export class ConfirmOrder implements ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
    private readonly matchRecorder: MatchRecorder,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute({
    orderId,
  }: ConfirmOrderRequest): Promise<StripeCheckoutSessionResult> {
    const session = this.mongoClient.startSession();

    // Transaction TODOs:
    // TODO(GLOBAL): Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    // TOOD(GLOBAL): Session initialization to withTransaction
    // TODO(GLOBAL): Transaction decorator
    const checkoutSession: Stripe.Checkout.Session = await withTransaction(
      () => this.matchOrderAndCheckout(orderId, session),
      session,
    );

    return {
      checkoutId: checkoutSession.id,
    };
  }

  // TODO: Error handling and rejection events
  private async matchOrderAndCheckout(
    orderId: UUID,
    session: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const draftedOrder = (await this.orderRepository.findOrder(
      orderId,
      session,
    )) as DraftedOrder;

    const matchId: UUID = await draftedOrder.matchHost(
      async (draftedOrderToMatchHostTo: DraftedOrder) =>
        this.findMatchingHost(draftedOrderToMatchHostTo, session),
      async (newlyMatchedOrder: DraftedOrder, matchedHostId: UUID) =>
        this.recordMatch(newlyMatchedOrder, matchedHostId, session),
    );

    const checkoutSession: StripeCheckoutSession = await this.createStripeCheckoutSession(
      draftedOrder,
      matchId,
    );

    return checkoutSession;
  }

  private async recordMatch(
    { id: orderId }: DraftedOrder,
    hostId: UUID,
    session: ClientSession,
  ): Promise<UUID> {
    const matchId: UUID = await this.matchRecorder.recordMatch(
      orderId,
      hostId,
      session,
    );

    return matchId;
  }

  private async findMatchingHost(
    { originCountry }: DraftedOrder,
    session: ClientSession,
  ): Promise<UUID> {
    const matchedHost: Host = await this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
      originCountry,
      session,
    );

    return matchedHost.id;
  }

  private async createStripeCheckoutSession(
    draftedOrder: DraftedOrder,
    matchId: UUID & MatchReference,
  ): Promise<StripeCheckoutSession> {
    const serviceFee: ServiceFee = await draftedOrder.calculateServiceFee();
    const stripeFee: Pick<
      Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
      'currency' | 'unit_amount'
    > = {
      currency: serviceFee.currency,
      unit_amount: Math.floor(serviceFee.amount * 100),
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
        line_items: [
          {
            price_data: {
              ...stripeFee,
              product_data: {
                name: 'Locly and Host Service Fee',
              },
            },
          },
        ],
        client_reference_id: matchId, // ! IMPORTANT !
        mode: 'payment',
        success_url: 'https://news.ycombinator.com',
        cancel_url: 'https://reddit.com',
      },
    );

    return checkoutSession;
  }
}
