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
import { ConfirmedOrderStatus, OrderStatus } from '../../domain/entity/Order';

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
    const receivedDate = new Date();

    await this.orderRepository.setItemProperties(
      {
        id: orderId,
        status: ConfirmedOrderStatus,
        hostId: hostId,
      },
      { id: itemId },
      { receivedDate },
      session,
    );

    return receivedDate;
  }
}
