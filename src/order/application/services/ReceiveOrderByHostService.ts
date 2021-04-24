import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain/UUID';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/utils';
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
    // TODO(GLOBAL): MongoClient dependency in withTransaction wrapper class
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute({
    orderId,
  }: ReceiveOrderHostRequest): Promise<ReceiveOrderHostResult> {
    const session = this.mongoClient.startSession();

    // TODO: Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    const receivedByHostDate: Date = await withTransaction(
      () => this.handleOrderReceiptByHost(orderId, session),
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
          session,
        ),
    );

    return receivedByHostDate;
  }
}
