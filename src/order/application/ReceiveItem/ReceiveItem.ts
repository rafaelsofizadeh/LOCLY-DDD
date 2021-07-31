import { HttpStatus, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { UUID } from '../../../common/domain';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import {
  ReceiveItemPayload,
  ReceiveItemResult,
  IReceiveItem,
} from './IReceiveItem';
import { Order, OrderStatus } from '../../entity/Order';
import { throwCustomException } from '../../../common/error-handling';

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
    const order: Order = await this.orderRepository.findOrder({
      orderId,
      status: OrderStatus.Confirmed,
      hostId,
    });

    // Can't receive an already-received item
    if (order.items.find(({ id }) => id === itemId).receivedDate) {
      throwCustomException(
        "Item already marked as 'received'.",
        { orderId, itemId },
        HttpStatus.NOT_ACCEPTABLE,
      )();
    }

    await this.orderRepository.setItemProperties(
      // status and hostId have already been 'tested' in findOrder() above
      { orderId },
      {
        itemId,
        // Query for field to be undefined:
        // https://docs.mongodb.com/manual/tutorial/query-for-null-fields/#existence-check
        receivedDate: null,
      },
      { receivedDate },
      mongoTransactionSession,
    );

    return receivedDate;
  }
}
