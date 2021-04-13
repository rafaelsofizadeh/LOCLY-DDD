import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { UUID } from '../../../common/domain/UUID';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';

import { Host } from '../../domain/entity/Host';
import { ConfirmOrderUseCaseService } from '../../domain/use-case/ConfirmOrderUseCaseService';
import { HostRepository } from '../port/HostRepository';
import { Match, MatchCache } from '../port/MatchCache';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class ConfirmOrderWebhookHandler implements ConfirmOrderUseCaseService {
  constructor(
    private readonly matchCache: MatchCache,
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // TODO: Transient SESSION
  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Event typing
  async execute(paymentFinalizedEvent: Stripe.Event): Promise<ConfirmedOrder> {
    // TODO: Check whether 'id' === 'checkoutSession.id'. Replace client_ref_id
    //https://stripe.com/docs/api/events/types#event_types-checkout.session.completed
    // TODO: Better typing
    const matchId: UUID = UUID(
      (paymentFinalizedEvent.data.object as Stripe.Checkout.Session)
        .client_reference_id as UUID,
    );

    const match: Match = await this.matchCache.retrieveAndDeleteMatch(matchId);

    const [draftedOrder, host] = (await Promise.all([
      this.orderRepository.findOrder(match.orderId),
      this.hostRepository.findHost(match.hostId),
    ])) as [DraftedOrder, Host];

    const confirmedOrder: ConfirmedOrder = draftedOrder.toConfirmed(host);
    host.acceptOrder(confirmedOrder);

    await Promise.all([
      this.orderRepository.persistOrderConfirmation(confirmedOrder, host),
      this.hostRepository.addOrderToHost(host, confirmedOrder),
    ]);

    this.eventEmitter.emit('order.confirmed');

    return confirmedOrder;
  }
}
