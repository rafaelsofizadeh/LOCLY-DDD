import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { UUID } from '../../../common/domain/UUID';
import { withTransaction } from '../../../common/utils';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';

import { OrderStatus } from '../../domain/entity/Order';
import { ConfirmOrderUseCaseService } from '../../domain/use-case/ConfirmOrderUseCaseService';
import { HostRepository } from '../port/HostRepository';
import { MatchRecorder } from '../port/MatchRecorder';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class ConfirmOrderWebhookHandler implements ConfirmOrderUseCaseService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    private readonly matchRecorder: MatchRecorder,
    private readonly eventEmitter: EventEmitter2,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // TODO: Transient SESSION that is connected to ConfirmOrderService
  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Event typing
  async execute(
    paymentFinalizedEvent: Stripe.Event,
  ): Promise<{ hostId: UUID }> {
    // TODO: Better Stripe typing
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

    return { hostId };
  }

  private async confirmOrder(
    matchId: UUID,
    session: ClientSession,
  ): Promise<{ orderId: UUID; hostId: UUID }> {
    const { orderId, hostId } = await this.matchRecorder.retrieveAndDeleteMatch(
      matchId,
    );

    console.log(orderId, hostId);

    await Promise.all([
      this.orderRepository.setProperties(
        orderId,
        {
          status: OrderStatus.Confirmed,
          hostId,
        },
        session,
      ),
      this.hostRepository.addOrderToHost(hostId, orderId, session),
    ]);

    return { orderId, hostId };
  }
}
