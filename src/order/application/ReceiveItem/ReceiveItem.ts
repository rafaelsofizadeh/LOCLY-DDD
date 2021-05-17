import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  ReceiveItemPayload,
  ReceiveItemResult,
  IReceiveItem,
} from './IReceiveItem';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class ReceiveItem implements IReceiveItem {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    { orderId, itemId, hostId }: ReceiveItemPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<ReceiveItemResult> {
    const receivedDate: Date = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.handleOrderItemReceipt(
          orderId,
          hostId,
          itemId,
          sessionWithTransaction,
        ),
      this.mongoClient,
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
