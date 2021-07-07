import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import { DeleteOrderPayload, IDeleteOrder } from './IDeleteOrder';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class DeleteOrder implements IDeleteOrder {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transaction
  async execute({
    port: deleteOrderPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<DeleteOrderPayload>): Promise<void> {
    await this.deleteOrder(deleteOrderPayload, mongoTransactionSession);
  }

  private async deleteOrder(
    { orderId, customerId }: DeleteOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<void> {
    await this.orderRepository.deleteOrder(
      { orderId, status: OrderStatus.Drafted, customerId },
      mongoTransactionSession,
    );
    await this.customerRepository.removeOrder(
      { customerId },
      orderId,
      mongoTransactionSession,
    );
  }
}
