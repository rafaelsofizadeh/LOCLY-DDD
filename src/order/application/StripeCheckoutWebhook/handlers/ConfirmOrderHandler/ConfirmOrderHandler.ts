import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';

import appConfig from '../../../../../../app.configuration';

import {
  Transaction,
  TransactionUseCasePort,
} from '../../../../../common/application';
import { Host } from '../../../../../host/entity/Host';

import { OrderStatus } from '../../../../entity/Order';
import {
  ConfirmOrderWebhookPayload,
  IConfirmOrderHandler,
  ConfirmOrderWebhookResult,
} from './IConfirmOrderHandler';
import { IHostRepository } from '../../../../../host/persistence/IHostRepository';
import { IOrderRepository } from '../../../../persistence/IOrderRepository';
import { Address } from '../../../../../common/domain';

@Injectable()
export class ConfirmOrderHandler implements IConfirmOrderHandler {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly hostRepository: IHostRepository,
  ) {}

  @Transaction
  async execute({
    port: confirmOrderRequest,
    mongoTransactionSession,
  }: TransactionUseCasePort<ConfirmOrderWebhookPayload>): Promise<
    ConfirmOrderWebhookResult
  > {
    const matchedHostAddress: Address = await this.confirmOrder(
      confirmOrderRequest,
      mongoTransactionSession,
    );

    return { address: matchedHostAddress };
  }

  private async confirmOrder(
    { orderId, hostId }: ConfirmOrderWebhookPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<Address> {
    const { address: hostAddress }: Host = await this.hostRepository.findHost(
      { hostId },
      mongoTransactionSession,
    );

    await this.orderRepository.setProperties(
      { orderId, status: OrderStatus.Drafted },
      { status: OrderStatus.Confirmed, hostId, hostAddress },
      mongoTransactionSession,
    );

    await this.hostRepository.addOrderToHost(
      { hostId },
      orderId,
      mongoTransactionSession,
    );

    return hostAddress;
  }
}
