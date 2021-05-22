import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import { DeleteOrderPayload, IDeleteOrder } from './IDeleteOrder';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class DeleteOrder implements IDeleteOrder {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly orderRepository: IOrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    deleteOrderPayload: DeleteOrderPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.deleteOrder(deleteOrderPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
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
