import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../../../common/application';

import { OrderStatus } from '../../../../entity/Order';
import {
  PayShipmentWebhookPayload,
  PayShipmentWebhookResult,
  IPayShipmentHandler,
} from './IPayShipmentHandler';
import { IOrderRepository } from '../../../../persistence/IOrderRepository';

@Injectable()
export class PayShipmentHandler implements IPayShipmentHandler {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: payShipmentRequest,
    mongoTransactionSession,
  }: TransactionUseCasePort<PayShipmentWebhookPayload>): Promise<
    PayShipmentWebhookResult
  > {
    await this.markOrderPaid(payShipmentRequest, mongoTransactionSession);
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
