import { IOrderRepository } from '../../../order/persistence/IOrderRepository';
import { IHostRepository } from '../../../host/persistence/IHostRepository';

import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { DeleteHostPayload, IDeleteHost } from './IDeleteHost';
import { Order, OrderStatus } from '../../../order/entity/Order';
import { throwCustomException } from '../../../common/error-handling';

@Injectable()
export class DeleteHost implements IDeleteHost {
  constructor(
    private readonly hostRepository: IHostRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transaction
  async execute({
    port: deleteHostPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<DeleteHostPayload>): Promise<void> {
    await this.deleteHost(deleteHostPayload, mongoTransactionSession);
  }

  private async deleteHost(
    { hostId }: DeleteHostPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<void> {
    const { orderIds } = await this.hostRepository.findHost(
      { hostId },
      mongoTransactionSession,
    );
    const orders: Order[] = await this.orderRepository.findOrders(
      orderIds,
      mongoTransactionSession,
    );

    const ordersInProgress = orders.filter(
      ({ status }) => status === OrderStatus.Completed,
    );

    // If number of completed orders !== total number of orders,
    // it means some orders are still incomplete (confirmed, finalized, paid, etc.)
    if (ordersInProgress.length !== orders.length) {
      throwCustomException(
        'Host has orders still in progress. Wait for the orders to complete and be delivered to the customer to delete the host account.',
        {
          ordersInProgress: ordersInProgress.map(({ id }) => id),
        },
      );
    }

    await this.hostRepository.deleteHost({ hostId }, mongoTransactionSession);
  }
}
