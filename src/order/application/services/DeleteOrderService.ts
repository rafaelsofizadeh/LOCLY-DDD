import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import {
  DeleteOrderRequest,
  DeleteOrderUseCase,
} from '../../domain/use-case/DeleteOrderUseCase';

@Injectable()
export class DeleteOrder implements DeleteOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    deleteOrderRequest: DeleteOrderRequest,
    session?: ClientSession,
  ): Promise<void> {
    await withTransaction(
      (transactionalSession: ClientSession) =>
        this.deleteOrder(deleteOrderRequest, transactionalSession),
      this.mongoClient,
      session,
    );
  }

  private async deleteOrder(
    { orderId, customerId }: DeleteOrderRequest,
    session: ClientSession,
  ): Promise<void> {
    await DraftedOrder.delete(
      {
        orderId,
        customerId,
      },
      toBeDeletedOrderId =>
        this.orderRepository.deleteOrder(toBeDeletedOrderId, session),
      (toRemoveOrderFromCustomerId, toBeRemovedFromCustomerOrderId) =>
        this.customerRepository.removeOrderFromCustomer(
          toRemoveOrderFromCustomerId,
          toBeRemovedFromCustomerOrderId,
          session,
        ),
    );
  }
}
