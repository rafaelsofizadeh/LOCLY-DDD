import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { UUID } from '../../../common/domain';
import { withTransaction } from '../../../common/application';

import { OrderStatus } from '../../domain/entity/Order';
import { PayOrderShipmentFeeUseCase } from '../../domain/use-case/PayOrderShipmentFeeUseCase';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class PayOrderShipmentFeeWebhookHandler
  implements PayOrderShipmentFeeUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // TODO(NOW): Multiple Stripe webhook handlers
  @StripeWebhookHandler('checkout.session.completed)
  // TODO: Better Stripe typing
  async execute(
    paymentFinalizedEvent: Stripe.Event,
    session?: ClientSession,
  ): Promise<void> {
    const { orderId } = (paymentFinalizedEvent.data
      .object as Stripe.Checkout.Session).metadata as { orderId: UUID };

    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.markOrderPaid(orderId, sessionWithTransaction),
      this.mongoClient,
      session,
    );
  }

  private async markOrderPaid(
    orderId: UUID,
    session: ClientSession,
  ): Promise<void> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Finalized },
      { status: OrderStatus.Paid },
      session,
    );
  }
}
