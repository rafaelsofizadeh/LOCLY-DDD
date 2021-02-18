import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Code } from '../../../common/error-handling/Code';
import { Order } from '../../domain/entity/Order';
import { Exception } from '../../../common/error-handling/Exception';

import { ConfirmOrderRequest } from '../../domain/use-case/confirm-order/ConfirmOrderRequest';
import { ConfirmOrderUseCase } from '../../domain/use-case/confirm-order/ConfirmOrderUseCase';
import { HostMatcher } from '../port/HostMatcher';
import { OrderRepository } from '../port/OrderRepository';
import { HostRepository } from '../port/HostRepository';
import { Host } from '../../domain/entity/Host';

@Injectable()
export class ConfirmOrder implements ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    private readonly hostMatcher: HostMatcher,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute({ orderId }: ConfirmOrderRequest) {
    const order: Order = await this.orderRepository.findOrder(orderId);

    const isServiceAvailable: boolean = await this.hostMatcher.checkServiceAvailability(
      order.originCountry,
      order.destination.country,
    );

    if (!isServiceAvailable) {
      // TODO: Wrapper around eventEmitter
      // TODO(?): Event emitting decorator
      this.eventEmitter.emit('order.rejected.service_availability');

      throw new Exception(
        Code.INTERNAL_ERROR,
        `Service not available in country ${order.originCountry}`,
      );
    }

    const matchedHost: Host = await this.hostMatcher
      .matchHost(order.originCountry)
      .catch(error => {
        // TODO: Wrapper around eventEmitter
        // TODO(?): Event emitting decorator
        this.eventEmitter.emit('order.rejected.host_availability');
        throw error;
      });

    // TODO(NOW)(IMPORTANT): Add persistance function. Update tracking.
    await order.confirm(
      matchedHost,
      this.orderRepository.addHostToOrder.bind(this.orderRepository),
    );

    await matchedHost.acceptOrder(
      order,
      this.hostRepository.addOrderToHost.bind(this.hostRepository),
    );

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emit('order.confirmed');

    return order;
  }
}
