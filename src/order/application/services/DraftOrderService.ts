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
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // Input validation in Controllers (/infrastructure)
  async execute(draftOrderRequest: DraftOrderRequest): Promise<DraftedOrder> {
    const session = this.mongoClient.startSession();

    const draftedOrder: DraftedOrder = await withTransaction(
      () => this.draftOrder(draftOrderRequest, session),
      session,
    );

    // Serialization in Controllers (/infrastructure)
    return draftedOrder;
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
