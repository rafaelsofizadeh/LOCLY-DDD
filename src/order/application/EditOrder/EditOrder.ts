import { EditOrderPayload, IEditOrder } from './IEditOrder';

import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { IDraftOrder } from '../DraftOrder/IDraftOrder';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import { DraftedOrder } from '../../entity/Order';

@Injectable()
export class EditOrder implements IEditOrder {
  constructor(private readonly draftOrderUseCase: IDraftOrder) {}

  @Transaction
  async execute({
    port: editOrderPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<EditOrderPayload>): Promise<DraftedOrder> {
    return this.editOrder(editOrderPayload, mongoTransactionSession);
  }

  private async editOrder(
    editOrderRequest: EditOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<DraftedOrder> {
    const draftOrder: DraftedOrder = await this.draftOrderUseCase.execute({
      port: editOrderRequest,
      mongoTransactionSession,
    });

    return draftOrder;
  }
}
