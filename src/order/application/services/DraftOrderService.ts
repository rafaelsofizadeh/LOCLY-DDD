import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';

import {
  DraftOrderRequest,
  DraftOrderUseCase,
} from '../../domain/use-case/DraftOrderUseCase';

import { Customer } from '../../domain/entity/Customer';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { Country } from '../../domain/data/Country';
import { Item } from '../../domain/entity/Item';
import { withTransaction } from '../../../common/utils';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';

@Injectable()
export class DraftOrder implements DraftOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // Input validation in Controllers (/infrastructure)
  async execute({
    customerId,
    originCountry,
    items,
  }: DraftOrderRequest): Promise<DraftedOrder> {
    const session = this.mongoClient.startSession();

    // TODO: Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    const draftedOrder: DraftedOrder = await withTransaction(
      () =>
        this.createDraftOrderAndPersist(
          customerId,
          originCountry,
          items,
          session,
        ),
      session,
    );

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emit('order.drafted', draftedOrder);

    // Serialization in Controllers (/infrastructure)
    return draftedOrder;
  }

  private async createDraftOrderAndPersist(
    customerId: UUID,
    originCountry: Country,
    items: Item[],
    session: ClientSession,
  ): Promise<DraftedOrder> {
    const customer: Customer = await this.customerRepository.findCustomer(
      customerId,
      session,
    );

    let draftedOrder: DraftedOrder;

    try {
      draftedOrder = DraftedOrder.create({
        customerId: customer.id,
        originCountry,
        items,
        destination: customer.selectedAddress,
      });
    } catch (exception) {
      // TODO: Wrapper around eventEmitter
      // TODO(?): Event emitting decorator
      // TODO(?): Move event emitting to execute()
      this.eventEmitter.emit('order.rejected.service_availability');
      throw exception;
    }

    customer.acceptOrder(draftedOrder);

    // Thanks to transactions, I can run these two concurrently
    await Promise.all([
      // TODO(GLOBAL): Add rollback for draftedOrder.draft
      // TODO: change to update (upstream?) for EditOrderService
      this.orderRepository.addOrder(draftedOrder, session),
      this.customerRepository.addOrderToCustomer(
        customer,
        draftedOrder,
        session,
      ),
    ]);

    return draftedOrder;
  }
}
