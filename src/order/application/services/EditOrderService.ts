import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderRepository } from '../port/OrderRepository';

import {
  EditOrderUseCase,
  UserEditOrderRequest,
} from '../../domain/use-case/EditOrderUseCase';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { withTransaction } from '../../../common/utils';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { OrderStatus } from '../../domain/entity/Order';
import { Exception } from '../../../common/error-handling/Exception';
import { Code } from '../../../common/error-handling/Code';

@Injectable()
export class EditOrder implements EditOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // Input validation in Controllers (/infrastructure)
  async execute({
    orderId,
    ...editOrderProps
  }: UserEditOrderRequest): Promise<DraftedOrder> {
    const session = this.mongoClient.startSession();

    // TODO: Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    const editedDraftOrder: DraftedOrder = await withTransaction(
      () => this.editDraftOrderAndPersist(orderId, editOrderProps, session),
      session,
    );

    this.eventEmitter.emit('order.edit');

    // Serialization in Controllers (/infrastructure)
    return editedDraftOrder;
  }

  private async editDraftOrderAndPersist(
    orderId: UUID,
    editOrderProps: Omit<UserEditOrderRequest, 'orderId'>,
    session: ClientSession,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = (await this.orderRepository.findOrder(
      orderId,
      session,
    )) as DraftedOrder;

    // TODO(RN, IMPORTANT): Check whether order status allows for editing
    if (draftedOrder.status !== OrderStatus.Drafted) {
      throw new Exception(
        Code.BAD_REQUEST_ERROR,
        `User can only edit draft orders. This order (${orderId}) is ${draftedOrder.status}.`,
      );
    }

    const editedKeys = draftedOrder.edit(editOrderProps);
    await this.orderRepository.updateOrder(draftedOrder, editedKeys, session);

    return draftedOrder;
  }
}
