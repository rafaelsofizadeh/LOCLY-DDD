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
import { HostRepository } from '../../../../../host/persistence/HostRepository';
import { OrderRepository } from '../../../../persistence/OrderRepository';

@Injectable()
export class ConfirmOrderHandler implements IConfirmOrderHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    confirmOrderHandlerRequest: ConfirmOrderHandlerRequest,
    session?: ClientSession,
  ): Promise<ConfirmOrderHandlerResult> {
    const matchedHostAddress: Address = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.confirmOrder(confirmOrderHandlerRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );

    return { address: matchedHostAddress };
  }

  private async confirmOrder(
    { orderId, hostId }: ConfirmOrderHandlerRequest,
    session: ClientSession,
  ): Promise<Address> {
    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Drafted },
      { status: OrderStatus.Confirmed, hostId },
      session,
    );

    await this.hostRepository.addOrderToHost(hostId, orderId, session);

    const { address }: Host = await this.hostRepository.findHost(
      hostId,
      session,
    );

    return address;
  }
}
