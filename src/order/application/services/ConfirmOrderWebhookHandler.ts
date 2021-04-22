import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { UUID } from '../../../common/domain/UUID';
import { withTransaction } from '../../../common/utils';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';

import { OrderStatus } from '../../domain/entity/Order';
import {
  ConfirmOrderUseCaseService,
  HostMatchResult,
} from '../../domain/use-case/ConfirmOrderUseCaseService';
import { HostRepository } from '../port/host/HostRepository';
import { MatchRecorder } from '../port/MatchRecorder';
import { OrderRepository } from '../port/order/OrderRepository';

@Injectable()
export class ConfirmOrderWebhookHandler implements ConfirmOrderUseCaseService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    private readonly matchRecorder: MatchRecorder,
    private readonly eventEmitter: EventEmitter2,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Better Stripe typing
  async execute(paymentFinalizedEvent: Stripe.Event): Promise<HostMatchResult> {
    const orderAndMatchId: UUID = UUID(
      (paymentFinalizedEvent.data.object as Stripe.Checkout.Session)
        .client_reference_id as UUID,
    );

    const session: ClientSession = this.mongoClient.startSession();

    const { hostId } = await withTransaction(
      () => this.confirmOrder(orderAndMatchId, session),
      session,
    );

    this.eventEmitter.emit('order.confirmed');

    return { matchedHostId: hostId };
  }

  private async confirmOrder(
    matchId: UUID,
    session: ClientSession,
  ): Promise<{ orderId: UUID; hostId: UUID }> {
    const { orderId, hostId } = await this.matchRecorder.retrieveAndDeleteMatch(
      matchId,
    );

    await ConfirmedOrder.confirm(
      orderId,
      hostId,
      (toConfirmOrderId: UUID, confirmedHostId: UUID) =>
        this.orderRepository.setProperties(
          toConfirmOrderId,
          {
            status: OrderStatus.Confirmed,
            hostId: confirmedHostId,
          },
          session,
        ),
      (toAddOrderToHostId: UUID, toAddOrderId: UUID) =>
        this.hostRepository.addOrderToHost(
          toAddOrderToHostId,
          toAddOrderId,
          session,
        ),
    );

    return { orderId, hostId };
  }
}
