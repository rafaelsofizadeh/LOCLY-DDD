import { IOrderRepository } from '../../persistence/IOrderRepository';

import { EditOrderPayload, IEditOrder } from './IEditOrder';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { IDraftOrder } from '../DraftOrder/IDraftOrder';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { withTransaction } from '../../../common/application';
import { OrderStatus, DraftedOrder } from '../../entity/Order';

@Injectable()
export class EditOrder implements IEditOrder {
  constructor(
    private readonly draftOrderUseCase: IDraftOrder,
    private readonly orderRepository: IOrderRepository,
    private readonly customerRepository: ICustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    editOrderPayload: EditOrderPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<DraftedOrder> {
    const draftOrder: DraftedOrder = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.editOrder(editOrderPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return draftOrder;
  }

  private async editOrder(
    { orderId, customerId, ...restEditOrderRequest }: EditOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<DraftedOrder> {
    await this.orderRepository.deleteOrder(
      {
        orderId,
        status: OrderStatus.Drafted,
        customerId,
      },
      mongoTransactionSession,
    );
    await this.customerRepository.removeOrderFromCustomer(
      { customerId },
      orderId,
      mongoTransactionSession,
    );

    const draftOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      { customerId, ...restEditOrderRequest },
      mongoTransactionSession,
    );

    return draftOrder;
  }
}
