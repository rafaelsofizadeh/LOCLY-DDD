import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { Host } from '../../domain/entity/Host';

import { Address, OrderStatus } from '../../domain/entity/Order';
import {
  ConfirmOrderRequest,
  ConfirmOrderUseCase,
  ConfirmOrderResult,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { HostRepository } from '../port/HostRepository';
import { OrderRepository } from '../port/OrderRepository';

@Injectable()
export class ConfirmOrderWebhookHandler implements ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostRepository: HostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    confirmOrderRequest: ConfirmOrderRequest,
    session?: ClientSession,
  ): Promise<ConfirmOrderResult> {
    const matchedHostAddress: Address = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.confirmOrder(confirmOrderRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );

    return { address: matchedHostAddress };
  }

  private async confirmOrder(
    { orderId, hostId }: ConfirmOrderRequest,
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
