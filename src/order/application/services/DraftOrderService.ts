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
import { DraftOrder } from '../../domain/entity/DraftOrder';
import { getShipmentCostQuote } from './ShipmentCostCalculator/getShipmentCostQuote';
import { checkServiceAvailability } from './checkServiceAvailability';

@Injectable()
export class DraftOrderService implements DraftOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    draftOrderRequest: DraftOrderRequest,
    session?: ClientSession,
  ): Promise<DraftOrder> {
    const draftOrder: DraftOrder = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.draftOrder(draftOrderRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );

    return draftOrder;
  }

  private async draftOrder(
    { customerId, originCountry, items, destination }: DraftOrderRequest,
    session: ClientSession,
  ): Promise<DraftOrder> {
    const draftOrder: DraftOrder = await DraftOrder.create(
      {
        customerId,
        originCountry,
        items,
        destination,
      },
      getShipmentCostQuote,
      checkServiceAvailability,
      (newlyDraftOrder: DraftOrder) =>
        this.orderRepository.addOrder(newlyDraftOrder, session),
      (toBeAddedToCustomerId, toBeAddedToCustomerOrderId) =>
        this.customerRepository.addOrderToCustomer(
          toBeAddedToCustomerId,
          toBeAddedToCustomerOrderId,
          session,
        ),
    );

    return draftOrder;
  }
}
