import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';

import {
  DraftOrderRequest,
  DraftOrderUseCase,
} from '../../domain/use-case/DraftOrderUseCase';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
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

  async execute(
    draftOrderRequest: DraftOrderRequest,
    session?: ClientSession,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.draftOrder(draftOrderRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );

    return draftedOrder;
  }

  private async draftOrder(
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
      (newlyDraftedOrder: DraftedOrder) =>
        this.orderRepository.addOrder(newlyDraftedOrder, session),
      (toBeAddedToCustomerId, toBeAddedToCustomerOrderId) =>
        this.customerRepository.addOrderToCustomer(
          toBeAddedToCustomerId,
          toBeAddedToCustomerOrderId,
          session,
        ),
    );

    return draftedOrder;
  }
}
