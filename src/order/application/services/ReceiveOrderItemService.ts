import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  ReceiveOrderItemRequest,
  ReceiveOrderItemResult,
  ReceiveOrderItemUseCase,
} from '../../domain/use-case/ReceiveOrderItemUseCase';
import { OrderStatus } from '../../domain/entity/Order';
import { Item } from '../../domain/entity/Item';

@Injectable()
export class ReceiveOrderItemService implements ReceiveOrderItemUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    { orderId, itemId, hostId }: ReceiveOrderItemRequest,
    session?: ClientSession,
  ): Promise<ReceiveOrderItemResult> {
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
    const receivedDate: Date = await Item.beReceived(
      orderId,
      hostId,
      itemId,
      (
        itemContainedOrderId: UUID,
        orderAssigneeHostId: UUID,
        toBeReceivedOrderItemId: UUID,
        receivedDate: Date,
      ) =>
        this.orderRepository.setItemProperties(
          {
            id: itemContainedOrderId,
            status: OrderStatus.Confirmed,
            hostId: orderAssigneeHostId,
          },
          { id: toBeReceivedOrderItemId },
          { receivedDate },
          session,
        ),
    );

    return receivedDate;
  }
}
