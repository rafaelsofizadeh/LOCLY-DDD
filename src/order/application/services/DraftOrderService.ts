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
import { withTransaction } from '../../../common/utils';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { getShipmentCostQuote } from './ShipmentCostCalculator/getShipmentCostQuote';
import { checkServiceAvailability } from './checkServiceAvailability';

@Injectable()
export class DraftOrder implements DraftOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // TODO(GLOBAL): Event emitting decorator
  // Input validation in Controllers (/infrastructure)
  async execute(draftOrderRequest: DraftOrderRequest): Promise<DraftedOrder> {
    // TODO(NOW)(GLOBAL): session initialization to withTransaction
    const session = this.mongoClient.startSession();

    try {
      const draftedOrder: DraftedOrder = await withTransaction(
        () => this.draftOrderAndPersist(draftOrderRequest, session),
        session,
      );

      this.eventEmitter.emit('order.drafted', draftedOrder);

      // Serialization in Controllers (/infrastructure)
      return draftedOrder;
    } catch (exception) {
      this.eventEmitter.emit('order.rejected.service_availability');
      throw exception;
    }
  }

  private async draftOrderAndPersist(
    { customerId, originCountry, items, destination }: DraftOrderRequest,
    session: ClientSession,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = await DraftedOrder.create(
      {
        customerId,
        originCountry,
        items,
        destination,
      },
      getShipmentCostQuote,
      checkServiceAvailability,
      async (newlyDraftedOrder: DraftedOrder) => {
        // TODO: change to update (upstream?) for EditOrderService
        await this.orderRepository.addOrder(newlyDraftedOrder, session);
        await this.customerRepository.addOrderToCustomer(
          newlyDraftedOrder,
          session,
        );
      },
    );

    return draftedOrder;
  }
}
