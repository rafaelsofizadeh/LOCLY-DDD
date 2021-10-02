import { HttpStatus, Injectable } from '@nestjs/common';
import { UserType } from '../../../auth/entity/Token';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { UUID } from '../../../common/domain';
import { throwCustomException } from '../../../common/error-handling';
import { Order } from '../../entity/Order';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { GetOrderPayload, GetOrderResult, IGetOrder } from './IGetOrder';

@Injectable()
export class GetOrder implements IGetOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: { orderId, userId, userType },
    mongoTransactionSession,
  }: TransactionUseCasePort<GetOrderPayload>): Promise<GetOrderResult> {
    const orderFilter: { orderId: UUID; customerId?: UUID; hostId?: UUID } = {
      orderId,
    };

    let orderLens: (order: Order) => GetOrderResult;

    try {
      if (userType === UserType.Customer) {
        orderFilter.customerId = userId;
        orderLens = ({ hostId, ...serializedOrder }) => serializedOrder;
      }

      if (userType === UserType.Host) {
        orderFilter.hostId = userId;
        orderLens = ({ customerId, initialShipmentCost, ...serializedOrder }) =>
          serializedOrder;
      }

      const order: Order = await this.orderRepository.findOrder(
        orderFilter,
        mongoTransactionSession,
      );

      return orderLens(order);
    } catch (error) {
      throwCustomException(
        'Order not found.',
        { orderId, ...orderFilter },
        HttpStatus.NOT_FOUND,
      )(error);
    }
  }
}
