import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { UUID } from '../../../common/domain';
import { withTransaction } from '../../../common/application';
import { Address } from '../../domain/entity/Address';
import { Host } from '../../domain/entity/Host';

import { OrderStatus } from '../../domain/entity/Order';
import {
  ConfirmOrderUseCase,
  HostMatchResult,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { HostRepository } from '../port/HostRepository';
import { OrderRepository } from '../port/OrderRepository';
import { Match } from './PreConfirmOrderService';

@Injectable()
export class ConfirmOrderWebhookHandler implements ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  // TODO: Better Stripe typing
  async execute(
    paymentFinalizedEvent: Stripe.Event,
    session?: ClientSession,
  ): Promise<HostMatchResult> {
    const { orderId, hostId } = (paymentFinalizedEvent.data
      .object as Stripe.Checkout.Session).metadata as Match;

    const matchedHostAddress: Address = await withTransaction(
      async (sessionWithTransaction: ClientSession) => {
        await this.confirmOrder(orderId, hostId, sessionWithTransaction);

        const host: Host = await this.hostRepository.findHost(
          hostId,
          sessionWithTransaction,
        );
        return host.address;
      },
      this.mongoClient,
      session,
    );

    return { matchedHostAddress };
  }

  private async confirmOrder(
    orderId: UUID,
    hostId: UUID,
    session: ClientSession,
  ): Promise<void> {
    await this.orderRepository.setProperties(
      { id: orderId, status: OrderStatus.Drafted },
      {
        status: OrderStatus.Confirmed,
        hostId,
      },
      session,
    );

    await this.hostRepository.addOrderToHost(hostId, orderId, session);
  }
}
