import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EntityId, UUID } from '../../../common/domain/EntityId';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';

import { Host } from '../../domain/entity/Host';
import { FinalizeOrderUseCase } from '../../domain/use-case/FinalizeOrderUseCase';
import { HostRepository } from '../port/HostRepository';
import { Match, MatchCache } from '../port/MatchCache';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class FinalizeOrderWebhookHandler implements FinalizeOrderUseCase {
  constructor(
    private readonly matchCache: MatchCache,
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
  ) {}

  // TODO: Transient SESSION
  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Event typing
  async execute(paymentFinalizedEvent: Stripe.Event): Promise<ConfirmedOrder> {
    // TODO: Check whether 'id' === 'checkoutSession.id'. Replace client_ref_id
    //https://stripe.com/docs/api/events/types#event_types-checkout.session.completed
    // TODO: Better typing
    const matchId: EntityId = new EntityId(
      (paymentFinalizedEvent.data.object as Stripe.Checkout.Session)
        .client_reference_id as UUID,
    );

    const match: Match = await this.matchCache.retrieveAndDeleteMatch(matchId);

    const [draftedOrder, host] = (await Promise.all([
      this.orderRepository.findOrder(match.orderId),
      this.hostRepository.findHost(match.hostId),
    ])) as [DraftedOrder, Host];

    const confirmedOrder: ConfirmedOrder = draftedOrder.toConfirmed();

    confirmedOrder.initialize(host);
    host.acceptOrder(confirmedOrder);

    await Promise.all([
      this.orderRepository.persistOrderConfirmation(confirmedOrder, host),
      this.hostRepository.addOrderToHost(host, confirmedOrder),
    ]);

    return confirmedOrder;
  }
}
