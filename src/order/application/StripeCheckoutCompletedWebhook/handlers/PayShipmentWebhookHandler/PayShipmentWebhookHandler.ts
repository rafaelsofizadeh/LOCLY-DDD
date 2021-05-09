import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../../../common/application';

import { OrderStatus } from '../../../../entity/Order';
import {
  PayShipmentRequest,
  PayShipmentResult,
  PayShipmentWebhookGateway,
} from './PayShipmentWebhookGateway';
import { OrderRepository } from '../../../../persistence/OrderRepository';

@Injectable()
export class PayShipmentWebhookHandler implements PayShipmentWebhookGateway {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    payShipmentRequest: PayShipmentRequest,
    session?: ClientSession,
  ): Promise<PayShipmentResult> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.markOrderPaid(payShipmentRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );
  }

  private async markOrderPaid(
    { orderId }: PayShipmentRequest,
    session: ClientSession,
  ): Promise<void> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Finalized },
      { status: OrderStatus.Paid },
      session,
    );
  }
}
