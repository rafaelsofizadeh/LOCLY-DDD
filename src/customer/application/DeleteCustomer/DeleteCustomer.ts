import { IOrderRepository } from '../../../order/persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { DeleteCustomerPayload, IDeleteCustomer } from './IDeleteCustomer';
import { Order, OrderStatus } from '../../../order/entity/Order';
import { throwCustomException } from '../../../common/error-handling';

@Injectable()
export class DeleteCustomer implements IDeleteCustomer {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transaction
  async execute({
    port: deleteCustomerPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<DeleteCustomerPayload>): Promise<void> {
    await this.deleteCustomer(deleteCustomerPayload, mongoTransactionSession);
  }

  private async deleteCustomer(
    { customerId }: DeleteCustomerPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<void> {
    const { orderIds } = await this.customerRepository.findCustomer(
      { customerId },
      mongoTransactionSession,
    );
    const orders: Order[] = await this.orderRepository.findOrders(
      orderIds,
      mongoTransactionSession,
    );

    const draftedOrders = orders.filter(
      ({ status }) => status === OrderStatus.Drafted,
    );
    const completedOrders = orders.filter(
      ({ status }) => status === OrderStatus.Completed,
    );
    const ordersInProgress = draftedOrders.concat(completedOrders);

    // If (number of drafted orders + number of completed orders) !== total number of orders,
    // it means some orders are still incomplete (confirmed, finalized, paid, etc.)
    if (ordersInProgress.length !== orders.length) {
      throwCustomException(
        'Customer has orders still in progress. Wait for the orders to complete and be delivered to the customer to delete the customer account.',
        {
          ordersInProgress: ordersInProgress.map(({ id }) => id),
        },
      );
    }

    await this.customerRepository.deleteCustomer(
      { customerId },
      mongoTransactionSession,
    );

    // Delete only drafted orders, retain all other order records.
    // Considering all the previous checks, 'all other' = completed orders.
    await this.orderRepository.deleteOrders(
      draftedOrders.map(({ id }) => id),
      mongoTransactionSession,
    );
  }
}
