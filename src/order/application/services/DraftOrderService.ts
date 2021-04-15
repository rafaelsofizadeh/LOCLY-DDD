import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';

import {
  DraftOrderRequest,
  DraftOrderUseCase,
} from '../../domain/use-case/DraftOrderUseCase';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { Country } from '../../domain/data/Country';
import { Item } from '../../domain/entity/Item';
import { withTransaction } from '../../../common/utils';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { getShipmentCostQuote } from './ShipmentCostCalculator/getShipmentCostQuote';
import { checkServiceAvailability } from './checkServiceAvailability';
import { Address } from '../../domain/entity/Address';

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
    destination,
    items,
  }: DraftOrderRequest): Promise<DraftedOrder> {
    const session = this.mongoClient.startSession();

    // TODO: Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    const draftedOrder: DraftedOrder = await withTransaction(
      () =>
        this.draftOrderAndPersist(
          customerId,
          originCountry,
          destination,
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

  private async draftOrderAndPersist(
    customerId: UUID,
    originCountry: Country,
    destination: Address,
    items: Item[],
    session: ClientSession,
  ): Promise<DraftedOrder> {
    let draftedOrder: DraftedOrder;

    try {
      draftedOrder = await DraftedOrder.create(
        {
          customerId,
          originCountry,
          items,
          destination,
        },
        getShipmentCostQuote,
        checkServiceAvailability,
        (newlyDraftedOrder: DraftedOrder) =>
          Promise.all([
            // TODO: change to update (upstream?) for EditOrderService
            this.orderRepository.addOrder(newlyDraftedOrder, session),
            this.customerRepository.addOrderToCustomer(
              newlyDraftedOrder,
              session,
            ),
          ]),
      );
    } catch (exception) {
      // TODO: Wrapper around eventEmitter
      // TODO(?): Event emitting decorator
      // TODO(?): Move event emitting to execute()
      this.eventEmitter.emit('order.rejected.service_availability');
      throw exception;
    }

    return draftedOrder;
  }
}
