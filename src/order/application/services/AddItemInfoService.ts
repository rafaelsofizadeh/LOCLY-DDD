import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import { ReceiveOrderItem } from '../../domain/entity/ReceiveOrderItem';
import { OrderStatus } from '../../domain/entity/Order';
import {
  AddItemInfoRequest,
  AddItemInfoResult,
  AddItemInfoUseCase,
} from '../../domain/use-case/AddItemInfoUseCase';

@Injectable()
export class AddItemInfoService implements AddItemInfoUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    addItemInfoRequest: AddItemInfoRequest,
    session?: ClientSession,
  ): Promise<AddItemInfoResult> {
    // TODO(GLOBAL): Transaction decorator
    const receivedByHostDate: Date = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.handleOrderReceiptByHost(
          addItemInfoRequest,
          sessionWithTransaction,
        ),
      this.mongoClient,
      session,
    );

    return {
      receivedByHostDate,
    };
  }

  private async handleOrderReceiptByHost(
    { orderId, customerId, itemId, photos }: AddItemInfoRequest,
    session: ClientSession,
  ): Promise<Date> {
    const receivedByHostDate: Date = await ReceiveOrderItem.receiveByHost(
      orderId,
      (toBeReceiveOrderItemId: UUID, receivedByHostDate: Date) =>
        this.orderRepository.setProperties(
          {
            id: toBeReceiveOrderItemId,
            status: OrderStatus.Confirmed,
            customerId,
          },
          {
            status: OrderStatus.ReceivedByHost,
            receivedByHostDate,
          },
          session,
        ),
    );

    return receivedByHostDate;
  }
}
