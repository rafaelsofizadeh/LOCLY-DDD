import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../persistence/OrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  ReceiveItemRequest,
  ReceiveItemResult,
  ReceiveItemUseCase,
} from './ReceiveItemUseCase';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class ReceiveItemService implements ReceiveItemUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    { orderId, itemId, hostId }: ReceiveItemRequest,
    session?: ClientSession,
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
      session,
    );

    return {
      receivedDate,
    };
  }

  private async handleOrderItemReceipt(
    orderId: UUID,
    hostId: UUID,
    itemId: UUID,
    session: ClientSession,
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
      session,
    );

    return receivedDate;
  }
}
