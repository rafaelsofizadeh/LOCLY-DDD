import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  ReceiveOrderHostRequest,
  ReceiveOrderHostResult,
  ReceiveOrderHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { ReceivedByHostOrder } from '../../domain/entity/ReceivedByHostOrder';
import { OrderStatus } from '../../domain/entity/Order';

@Injectable()
export class ReceiveOrderHost implements ReceiveOrderHostUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    { orderId }: ReceiveOrderHostRequest,
    session?: ClientSession,
  ): Promise<ReceiveOrderHostResult> {
    const receivedByHostDate: Date = await withTransaction(
      (transactionalSession: ClientSession) =>
        this.handleOrderReceiptByHost(orderId, transactionalSession),
      this.mongoClient,
      session,
    );

    return {
      receivedByHostDate,
    };
  }

  private async handleOrderReceiptByHost(
    orderId: UUID,
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
          // TODO:
          {},
          session,
        ),
    );

    return receivedByHostDate;
  }
}
