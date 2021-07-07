import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { UUID } from '../../../common/domain';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import {
  ReceiveItemPayload,
  ReceiveItemResult,
  IReceiveItem,
} from './IReceiveItem';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class ReceiveItem implements IReceiveItem {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: { orderId, itemId, hostId },
    mongoTransactionSession,
  }: TransactionUseCasePort<ReceiveItemPayload>): Promise<ReceiveItemResult> {
    const receivedDate: Date = await this.handleOrderItemReceipt(
      orderId,
      hostId,
      itemId,
      mongoTransactionSession,
    );

    return {
      receivedDate,
    };
  }

  private async handleOrderItemReceipt(
    orderId: UUID,
    hostId: UUID,
    itemId: UUID,
    mongoTransactionSession: ClientSession,
  ): Promise<Date> {
    const receivedDate = new Date();

    await this.orderRepository.setItemProperties(
      {
        orderId,
        status: OrderStatus.Confirmed,
        hostId,
      },
      {
        itemId,
        // Can't receive an already-received item
        // Query for undefined field https://docs.mongodb.com/manual/tutorial/query-for-null-fields/#existence-check
        receivedDate: null,
      },
      { receivedDate },
      mongoTransactionSession,
    );

    return receivedDate;
  }
}
