import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../../../common/application';

import { OrderStatus } from '../../../../entity/Order';
import {
  PayShipmentWebhookPayload,
  PayShipmentWebhookResult,
  IPayShipmentHandler,
} from './IPayShipmentHandler';
import { IOrderRepository } from '../../../../persistence/IOrderRepository';

@Injectable()
export class PayShipmentHandler implements IPayShipmentHandler {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    payShipmentRequest: PayShipmentWebhookPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<PayShipmentWebhookResult> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.markOrderPaid(payShipmentRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async markOrderPaid(
    { orderId }: PayShipmentWebhookPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<void> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Finalized },
      { status: OrderStatus.Paid },
      mongoTransactionSession,
    );
  }
}
