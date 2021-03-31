import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';
import {
  ShipmentCostRequest,
  getShipmentCostQuote,
} from '../services/ShipmentCostCalculator/getShipmentCostQuote';

import {
  CreateOrderRequest,
  CreateOrderUseCase,
} from '../../domain/use-case/CreateOrderUseCase';

import { Customer } from '../../domain/entity/Customer';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { EntityId } from '../../../common/domain/EntityId';
import { Country } from '../../domain/data/Country';
import { Item } from '../../domain/entity/Item';
import { withTransaction } from '../../../common/utils';
import { Exception } from '../../../common/error-handling/Exception';
import { Code } from '../../../common/error-handling/Code';
import { HostMatcher } from '../port/HostMatcher';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';

@Injectable()
export class CreateOrder implements CreateOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    private readonly hostMatcher: HostMatcher,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  // Input validation in Controllers (/infrastructure)
  async execute({
    customerId,
    originCountry,
    items,
  }: CreateOrderRequest): Promise<DraftedOrder> {
    const session = this.mongoClient.startSession();

    // TODO: Helper function instead of assigning a let variable in try block: https://jira.mongodb.org/browse/NODE-2014
    const order: DraftedOrder = await withTransaction(
      () =>
        this.createDraftOrderAndPersist(
          customerId,
          originCountry,
          items,
          session,
        ),
      session,
    );

    // Serialization in Controllers (/infrastructure)
    return order;
  }

  private async createDraftOrderAndPersist(
    customerId: EntityId,
    originCountry: Country,
    items: Item[],
    session: ClientSession,
  ): Promise<DraftedOrder> {
    const customer: Customer = await this.customerRepository.findCustomer(
      customerId,
      session,
    );

    const draftedOrder = new DraftedOrder({
      customerId: customer.id,
      originCountry,
      items,
      destination: customer.selectedAddress,
    });

    await this.checkServiceAvailability(draftedOrder);

    draftedOrder.initialize((costRequest: ShipmentCostRequest) =>
      getShipmentCostQuote(costRequest),
    );
    customer.acceptOrder(draftedOrder);

    // Thanks to transactions, I can run these two concurrently
    await Promise.all([
      // TODO(GLOBAL): Add rollback for draftedOrder.draft
      this.orderRepository.addOrder(draftedOrder, session),
      this.customerRepository.addOrderToCustomer(
        customer,
        draftedOrder,
        session,
      ),
    ]);

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emitAsync('order.drafted', draftedOrder);

    return draftedOrder;
  }

  // TODO: Remove redundancy with ShipmentCostCalculator
  private async checkServiceAvailability({
    originCountry,
    destination: { country: destinationCountry },
  }: DraftedOrder): Promise<void> {
    const isServiceAvailable: boolean = await this.hostMatcher.checkServiceAvailability(
      originCountry,
      destinationCountry,
    );

    if (!isServiceAvailable) {
      // TODO: Wrapper around eventEmitter
      // TODO(?): Event emitting decorator
      this.eventEmitter.emit('order.rejected.service_availability');

      throw new Exception(
        Code.INTERNAL_ERROR,
        `Service not available in origin ${originCountry} or destination ${destinationCountry}`,
      );
    }
  }
}
