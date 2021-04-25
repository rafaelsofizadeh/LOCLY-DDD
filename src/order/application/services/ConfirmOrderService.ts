import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { UUID } from '../../../common/domain';
import { withTransaction } from '../../../common/application';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';

import { OrderStatus } from '../../domain/entity/Order';
import {
  ConfirmOrderUseCase,
  HostMatchResult,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { HostRepository } from '../port/HostRepository';
import { MatchRecorder } from '../port/MatchRecorder';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class ConfirmOrderWebhookHandler implements ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    private readonly matchRecorder: MatchRecorder,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Better Stripe typing
  async execute(
    paymentFinalizedEvent: Stripe.Event,
    session?: ClientSession,
  ): Promise<HostMatchResult> {
    const orderAndMatchId: UUID = UUID(
      (paymentFinalizedEvent.data.object as Stripe.Checkout.Session)
        .client_reference_id as UUID,
    );

    const { hostId } = await withTransaction(
      (transactionalSession: ClientSession) =>
        this.confirmOrder(orderAndMatchId, transactionalSession),
      this.mongoClient,
      session,
    );

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
