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
import { UUID } from '../../../common/domain/UUID';
import { CustomerRepository } from '../port/CustomerRepository';
import { withTransaction } from '../../../common/utils';

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
    // TODO(GLOBAL): Application-wide security rules (orderId <-> customerId <-> hostId control)

    const draftedOrder: DraftedOrder = await DraftedOrder.edit(
      editOrderRequest,
      (toBeDeletedOrderId: UUID) =>
        this.orderRepository.deleteOrder(toBeDeletedOrderId, session),
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
