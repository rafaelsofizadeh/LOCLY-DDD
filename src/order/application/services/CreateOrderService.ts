import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';
import { ShipmentCostCalculator } from '../port/ShipmentCostCalculator';

import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';

import { Order } from '../../domain/entity/Order';
import { Customer } from '../../domain/entity/Customer';
import { CreateOrderRequest } from '../../domain/use-case/create-order/CreateOrderRequest';
import { Injectable } from '@nestjs/common';
import { HostMatcher } from '../port/HostMatcher';

@Injectable()
export class CreateOrder implements CreateOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    private readonly shipmentCostCalculator: ShipmentCostCalculator,
    private readonly hostMatcher: HostMatcher,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Input validation in Controllers (/infrastructure)
  async execute({
    customerId,
    originCountry,
    items,
  }: CreateOrderRequest): Promise<Order> {
    const customer: Customer = await this.customerRepository.findCustomer(
      customerId,
    );

    const order: Order = new Order({
      customer,
      originCountry,
      items,
    });

    await order.validate();

    // TODO(?): Turn into a constructor action, after enough use cases accumulate for this
    order.calculateShipmentCost(this.shipmentCostCalculator);

    await this.orderRepository.addOrder(order);

    // TODO(NOW): Make this throw and handle all subsequent events (refer to the diagram) (or find a better way)
    await this.hostMatcher.checkServiceAvailability(
      order.originCountry,
      order.destination.country,
    );

    // TODO(NOW): Make this throw and handle all subsequent events (refer to the diagram) (or find a better way)
    const host = await this.hostMatcher.matchHost(originCountry);
    order.host = host;

    // TODO: Wrapper around eventEmitter
    this.eventEmitter.emitAsync('order.created', order);

    // Serialization in Controllers (/infrastructure)
    return order;
  }
}
