import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../../../common/application';
import { Host } from '../../../../entity/Host';

import { Address, OrderStatus } from '../../../../entity/Order';
import {
  ConfirmOrderHandlerRequest,
  IConfirmOrderHandler,
  ConfirmOrderHandlerResult,
} from './IConfirmOrderHandler';
import { IHostRepository } from '../../../../../host/persistence/IHostRepository';
import { IOrderRepository } from '../../../../persistence/IOrderRepository';

@Injectable()
export class ConfirmOrderHandler implements IConfirmOrderHandler {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    confirmOrderHandlerRequest: ConfirmOrderHandlerRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<ConfirmOrderHandlerResult> {
    const matchedHostAddress: Address = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.confirmOrder(confirmOrderHandlerRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return { address: matchedHostAddress };
  }

  private async confirmOrder(
    { orderId, hostId }: ConfirmOrderHandlerRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<Address> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Drafted },
      { status: OrderStatus.Confirmed, hostId },
      mongoTransactionSession,
    );

    await this.hostRepository.addOrderToHost(
      hostId,
      orderId,
      mongoTransactionSession,
    );

    const { address }: Host = await this.hostRepository.findHost(
      hostId,
      mongoTransactionSession,
    );

    return address;
  }
}
