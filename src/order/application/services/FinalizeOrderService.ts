import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EntityId, UUID } from '../../../common/domain/EntityId';

import { Host } from '../../domain/entity/Host';
import { Order } from '../../domain/entity/Order';
import { FinalizeOrderUseCase } from '../../domain/use-case/FinalizeOrderUseCase';
import { HostRepository } from '../port/HostRepository';
import { Match, MatchCache } from '../port/MatchCache';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class FinalizeOrderService implements FinalizeOrderUseCase {
  constructor(
    private readonly matchCache: MatchCache,
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Event typing
  async execute(paymentFinalizedEvent: Stripe.Event): Promise<Order> {
    // TODO: Check whether 'id' === 'checkoutSession.id'. Replace client_ref_id
    //https://stripe.com/docs/api/events/types#event_types-checkout.session.completed
    // TODO: Better typing
    const matchId: EntityId = new EntityId(
      (paymentFinalizedEvent.data.object as Stripe.Checkout.Session)
        .client_reference_id as UUID,
    );

    const match: Match = await this.matchCache.retrieveAndDeleteMatch(matchId);

    const [order, host]: [Order, Host] = await Promise.all([
      this.orderRepository.findOrder(match.orderId),
      this.hostRepository.findHost(match.hostId),
    ]);

    await Promise.all([
      order.confirm(
        host,
        this.orderRepository.addHostToOrder.bind(this.orderRepository),
      ),
      host.acceptOrder(
        order,
        this.hostRepository.addOrderToHost.bind(this.hostRepository),
      ),
    ]);

    return order;
  }
}
