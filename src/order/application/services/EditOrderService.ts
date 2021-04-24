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

@Injectable()
export class EditOrder implements EditOrderUseCase {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // Input validation in Controllers (/infrastructure)
  async execute(editOrderRequest: EditOrderRequest): Promise<DraftedOrder> {
    const session = this.mongoClient.startSession();

    // TODO: can't use withTransaction, because draftOrderUseCase already calls a session of its own.
    // Potential solution!: let draftOrderUseCase and withTransaction accept a pre-defined session as an argument
    const draftedOrder: DraftedOrder = await this.editOrderAndPersist(
      editOrderRequest,
      session,
    );

    // Serialization in Controllers (/infrastructure)
    return draftedOrder;
  }

  private async editOrderAndPersist(
    editOrderRequest: EditOrderRequest,
    // TODO(NOW)(IMPORTANT): transactions
    session: ClientSession,
  ): Promise<DraftedOrder> {
    // TODO(GLOBAL): Application-wide security rules (orderId <-> customerId <-> hostId control)

    const draftedOrder: DraftedOrder = await DraftedOrder.edit(
      editOrderRequest,
      // throws if orderId doesn't exist
      (toBeDeletedOrderId: UUID) =>
        this.orderRepository.deleteOrder(toBeDeletedOrderId),
      (draftOrderRequest: DraftOrderRequest) =>
        this.draftOrderUseCase.execute(draftOrderRequest),
    );

    return draftedOrder;
  }
}
