import { OrderRepositoryPort } from '../port/OrderRepositoryPort';
import { CustomerRepositoryPort } from '../port/CustomerRepositoryPort';
import { ShipmentCostCalculatorPort } from '../port/ShipmentCostCalculatorPort';

import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';

import { Order } from '../../domain/entity/Order';
import { Customer } from '../../domain/entity/Customer';
import { CreateOrderRequestPort } from '../../domain/use-case/create-order/CreateOrderRequestPort';
import { isISO31661Alpha3, validate } from 'class-validator';

export class CreateOrder implements CreateOrderUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryPort,
    private readonly orderRepository: OrderRepositoryPort,
    private readonly shipmentCostCalculator: ShipmentCostCalculatorPort,
  ) {}

  // Input validation in Controllers (infra)
  async execute({
    customerId,
    originCountry,
    items,
  }: CreateOrderRequestPort): Promise<Order> {
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
    // order.calculateShipmentCost(this.shipmentCostCalculator);

    this.orderRepository.addOrder(order);

    // Serialization in Controllers (infra)
    return order;
  }
}
