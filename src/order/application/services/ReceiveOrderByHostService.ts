import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  ReceiveOrderByHostRequest,
  ReceiveOrderByHostResult,
  ReceiveOrderByHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { ReceivedByHostOrder } from '../../domain/entity/ReceivedByHostOrder';
import { OrderStatus } from '../../domain/entity/Order';

@Injectable()
export class ReceiveOrderByHost implements ReceiveOrderByHostUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    { orderId, customerId }: ReceiveOrderByHostRequest,
    session?: ClientSession,
  ): Promise<ReceiveOrderByHostResult> {
    const receivedByHostDate: Date = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.handleOrderReceiptByHost(
          orderId,
          customerId,
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
    orderId: UUID,
    customerId: UUID,
    session: ClientSession,
  ): Promise<Date> {
    const receivedByHostDate: Date = await ReceivedByHostOrder.receiveByHost(
      orderId,
      (toBeReceivedByHostOrderId: UUID, receivedByHostDate: Date) =>
        this.orderRepository.setProperties(
          toBeReceivedByHostOrderId,
          {
            status: OrderStatus.ReceivedByHost,
            receivedByHostDate,
          },
          { status: OrderStatus.Confirmed, customerId },
          session,
        ),
    );

    return receivedByHostDate;
  }
}
