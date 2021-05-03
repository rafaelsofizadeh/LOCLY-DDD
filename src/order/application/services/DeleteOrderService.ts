import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import { DraftOrder } from '../../domain/entity/DraftOrder';
import {
  DeleteOrderRequest,
  DeleteOrderUseCase,
} from '../../domain/use-case/DeleteOrderUseCase';
import { UUID } from '../../../common/domain';

@Injectable()
export class DeleteOrderService implements DeleteOrderUseCase {
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
      (sessionWithTransaction: ClientSession) =>
        this.deleteOrder(deleteOrderRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );
  }

  private async deleteOrder(
    { orderId, customerId }: DeleteOrderRequest,
    session: ClientSession,
  ): Promise<void> {
    await DraftOrder.delete(
      {
        orderId,
        customerId,
      },
      (toBeDeletedOrderId: UUID, orderOwnerCustomerId: UUID) =>
        this.orderRepository.deleteOrder(
          { id: toBeDeletedOrderId, customerId: orderOwnerCustomerId },
          session,
        ),
      (
        toRemoveOrderFromCustomerId: UUID,
        toBeRemovedFromCustomerOrderId: UUID,
      ) =>
        this.customerRepository.removeOrderFromCustomer(
          toRemoveOrderFromCustomerId,
          toBeRemovedFromCustomerOrderId,
          session,
        ),
    );
  }
}
