import { EditOrderPayload, IEditOrder } from './IEditOrder';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { IDraftOrder } from '../DraftOrder/IDraftOrder';
import { withTransaction } from '../../../common/application';
import { DraftedOrder } from '../../entity/Order';

@Injectable()
export class EditOrder implements IEditOrder {
  constructor(
    private readonly draftOrderUseCase: IDraftOrder,
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
    editOrderRequest: EditOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<DraftedOrder> {
    const draftOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      editOrderRequest,
      mongoTransactionSession,
    );

    return draftOrder;
  }
}
