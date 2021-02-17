import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderRepository } from '../port/OrderRepository';
import { CustomerRepository } from '../port/CustomerRepository';
import { ShipmentCostCalculator } from '../port/ShipmentCostCalculator';

import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';

import { Order } from '../../domain/entity/Order';
import { Customer } from '../../domain/entity/Customer';
import { CreateOrderRequest } from '../../domain/use-case/create-order/CreateOrderRequest';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrder implements CreateOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    private readonly shipmentCostCalculator: ShipmentCostCalculator,
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

    await order.draft(
      this.shipmentCostCalculator.getRate.bind(this.shipmentCostCalculator),
      this.orderRepository.addOrder.bind(this.orderRepository),
    );

    await customer.acceptOrder(
      order,
      this.customerRepository.addOrderToCustomer.bind(this.customerRepository),
    );

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emitAsync('order.drafted', order);

    // Serialization in Controllers (/infrastructure)
    return order;
  }
}
