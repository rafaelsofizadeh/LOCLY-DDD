import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain/UUID';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/utils';
import {
  ReceiveOrderHostRequest,
  ReceiveOrderHostResult,
  ReceiveOrderHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { ReceivedByHostOrder } from '../../domain/entity/ReceivedByHostOrder';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';

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
      () => this.handleOrderReceiptByHost(orderId, session),
      session,
    );

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emit('order.received_by_host');

    return {
      receivedByHostDate,
    };
  }

  // TODO(IMPORTANT): Streamline the find-transform_to_entity-update pipeline. This should be a simple DB update
  // method. Or should it?
  private async handleOrderReceiptByHost(
    orderId: UUID,
    session: ClientSession,
  ): Promise<Date> {
    const confirmedOrder = (await this.orderRepository.findOrder(
      orderId,
      session,
    )) as ConfirmedOrder;

    const receivedByHostOrder: ReceivedByHostOrder = confirmedOrder.toReceivedByHost();
    await this.orderRepository.persistHostReceipt(receivedByHostOrder);

    return receivedByHostOrder.receivedByHostDate;
  }
}
