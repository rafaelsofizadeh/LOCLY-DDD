import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../../../common/application';

import { OrderStatus } from '../../../../entity/Order';
import {
  PayShipmentHandlerRequest,
  PayShipmentHandlerResult,
  IPayShipmentHandler,
} from './IPayShipmentHandler';
import { OrderRepository } from '../../../../persistence/OrderRepository';

@Injectable()
export class PayShipmentHandler implements IPayShipmentHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    payShipmentRequest: PayShipmentHandlerRequest,
    session?: ClientSession,
  ): Promise<PayShipmentHandlerResult> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.markOrderPaid(payShipmentRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );
  }

  private async markOrderPaid(
    { orderId }: PayShipmentHandlerRequest,
    session: ClientSession,
  ): Promise<void> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Finalized },
      { status: OrderStatus.Paid },
      session,
    );
  }
}
