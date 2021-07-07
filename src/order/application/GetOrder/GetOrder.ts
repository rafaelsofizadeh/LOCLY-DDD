import { HttpStatus, Injectable } from '@nestjs/common';
import { EntityType } from '../../../auth/entity/Token';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import { Order } from '../../entity/Order';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { GetOrderPayload, IGetOrder } from './IGetOrder';

@Injectable()
export class GetOrder implements IGetOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: { orderId, userId, userType },
    mongoTransactionSession,
  }: TransactionUseCasePort<GetOrderPayload>): Promise<Order> {
    const userFilter =
      userType === EntityType.Customer
        ? { customerId: userId }
        : { hostId: userId };

    try {
      const order: Order = await this.orderRepository.findOrder(
        {
          orderId,
          ...userFilter,
        },
        mongoTransactionSession,
      );

      return order;
    } catch (error) {
      throwCustomException(
        'Order not found.',
        { orderId, ...userFilter },
        HttpStatus.NOT_FOUND,
      )(error);
    }
  }
}
