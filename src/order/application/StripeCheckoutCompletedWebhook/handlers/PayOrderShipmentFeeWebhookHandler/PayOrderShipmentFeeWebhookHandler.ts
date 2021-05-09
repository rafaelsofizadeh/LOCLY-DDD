import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../../../common/application';

import { OrderStatus } from '../../../../entity/Order';
import {
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeResult,
  PayOrderShipmentFeeWebhookGateway,
} from './PayOrderShipmentFeeWebhookGateway';
import { OrderRepository } from '../../../../persistence/OrderRepository';

@Injectable()
export class PayOrderShipmentFeeWebhookHandler
  implements PayOrderShipmentFeeWebhookGateway {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    payOrderShipmentFeeRequest: PayOrderShipmentFeeRequest,
    session?: ClientSession,
  ): Promise<PayOrderShipmentFeeResult> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.markOrderPaid(payOrderShipmentFeeRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );
  }

  private async markOrderPaid(
    { orderId }: PayOrderShipmentFeeRequest,
    session: ClientSession,
  ): Promise<void> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Finalized },
      { status: OrderStatus.Paid },
      session,
    );
  }
}
