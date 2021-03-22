import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import { Code } from '../../../common/error-handling/Code';
import { Order } from '../../domain/entity/Order';
import { Exception } from '../../../common/error-handling/Exception';

import { HostMatcher } from '../port/HostMatcher';
import { OrderRepository } from '../port/OrderRepository';
import { Host } from '../../domain/entity/Host';
import { MatchCache } from '../port/MatchCache';
import { EntityId } from '../../../common/domain/EntityId';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/utils';
import {
  ReceiveOrderHostRequest,
  ReceiveOrderHostResult,
  ReceiveOrderHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';

export type MatchReference = Stripe.Checkout.Session['client_reference_id'];

@Injectable()
export class ReceiveOrderHost implements ReceiveOrderHostUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
    // TODO(GLOBAL): MongoClient dependency in withTransaction wrapper class
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute({
    orderId,
  }: ReceiveOrderHostRequest): Promise<ReceiveOrderHostResult> {
    const session = this.mongoClient.startSession();

    // TODO: Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    const receivedByHostDate: Date = await withTransaction(
      () => this.setOrderAsReceivedByHost(orderId, session),
      session,
    );

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emit('order.received_by_host');

    return {
      receivedByHostDate,
    };
  }

  private async setOrderAsReceivedByHost(
    orderId: EntityId,
    session: ClientSession,
  ): Promise<Date> {
    const order: Order = await this.orderRepository.findOrder(orderId, session);

    await order.receivedByHost((receivedByHostDate: Date) =>
      this.orderRepository.setOrderAsReceivedByHost(order, receivedByHostDate),
    );

    return order.receivedByHostDate;
  }
}
