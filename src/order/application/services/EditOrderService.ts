import { OrderRepository } from '../port/OrderRepository';

import {
  EditOrderRequest,
  EditOrderUseCase,
} from '../../domain/use-case/EditOrderUseCase';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { DraftOrder } from '../../domain/entity/DraftOrder';
import {
  DraftOrderRequest,
  DraftOrderUseCase,
} from '../../domain/use-case/DraftOrderUseCase';
import { UUID } from '../../../common/domain';
import { CustomerRepository } from '../port/CustomerRepository';
import { withTransaction } from '../../../common/application';
import { OrderStatus } from '../../domain/entity/Order';

@Injectable()
export class EditOrderService implements EditOrderUseCase {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    editOrderRequest: EditOrderRequest,
    session?: ClientSession,
  ): Promise<DraftOrder> {
    const draftOrder: DraftOrder = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.editOrder(editOrderRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );

    return draftOrder;
  }

  private async editOrder(
    editOrderRequest: EditOrderRequest,
    session: ClientSession,
  ): Promise<DraftOrder> {
    const draftOrder: DraftOrder = await DraftOrder.edit(
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

    return draftOrder;
  }
}
