import { OrderRepository } from '../port/OrderRepository';

import {
  EditOrderRequest,
  EditOrderUseCase,
} from '../../domain/use-case/EditOrderUseCase';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import {
  DraftOrderRequest,
  DraftOrderUseCase,
} from '../../domain/use-case/DraftOrderUseCase';
import { UUID } from '../../../common/domain';
import { CustomerRepository } from '../port/CustomerRepository';
import { withTransaction } from '../../../common/application';
import { OrderStatus } from '../../domain/entity/Order';

@Injectable()
export class EditOrder implements EditOrderUseCase {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    editOrderRequest: EditOrderRequest,
    session?: ClientSession,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = await withTransaction(
      (transactionalSession: ClientSession) =>
        this.editOrder(editOrderRequest, transactionalSession),
      this.mongoClient,
      session,
    );

    return draftedOrder;
  }

  private async editOrder(
    editOrderRequest: EditOrderRequest,
    session: ClientSession,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = await DraftedOrder.edit(
      editOrderRequest,
      (toBeDeletedOrderId: UUID, orderOwnerCustomerId: UUID) =>
        this.orderRepository.deleteOrder(
          {
            id: toBeDeletedOrderId,
            status: OrderStatus.Drafted,
            customerId: orderOwnerCustomerId,
          },
          session,
        ),
      (toBeRemovedFromCustomerId: UUID, toBeRemovedFromCustomerOrderId: UUID) =>
        this.customerRepository.removeOrderFromCustomer(
          toBeRemovedFromCustomerId,
          toBeRemovedFromCustomerOrderId,
          session,
        ),
      (draftOrderRequest: DraftOrderRequest) =>
        this.draftOrderUseCase.execute(draftOrderRequest, session),
    );

    return draftedOrder;
  }
}
