import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
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
import { DraftedOrder, ServiceFee } from '../../domain/entity/DraftedOrder';
import { HostRepository } from '../port/HostRepository';
import { OrderStatus } from '../../domain/entity/Order';

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
export class PreConfirmOrder implements PreConfirmOrderUseCase {
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
      (transactionalSession: ClientSession) =>
        this.matchOrderAndCheckout(
          preConfirmOrderRequest,
          transactionalSession,
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
    { orderId }: PreConfirmOrderRequest,
    session: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const draftedOrder = (await this.orderRepository.findOrder(
      orderId,
      OrderStatus.Drafted,
      session,
    )) as DraftedOrder;

    const hostId: UUID = await this.findMatchingHost(draftedOrder, session);

    const checkoutSession: StripeCheckoutSession = await this.createStripeCheckoutSession(
      draftedOrder,
      hostId,
    );

    return checkoutSession;
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
    hostId: UUID,
  ): Promise<StripeCheckoutSession> {
    const serviceFee: ServiceFee = await draftedOrder.calculateServiceFee();
    const stripePrice: StripePrice = this.stripePrice(serviceFee);
    const match: Match = {
      orderId: draftedOrder.id,
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
        // TODO: pre-fill customer / customer_email
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

  private stripePrice(serviceFee: ServiceFee) {
    return {
      currency: serviceFee.currency,
      unit_amount: Math.floor(serviceFee.amount * 100),
    };
  }
}
