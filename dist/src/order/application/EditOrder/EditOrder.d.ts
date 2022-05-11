import { EditOrderPayload, IEditOrder } from './IEditOrder';
import { IDraftOrder } from '../DraftOrder/IDraftOrder';
import { TransactionUseCasePort } from '../../../common/application';
import { DraftedOrder } from '../../entity/Order';
export declare class EditOrder implements IEditOrder {
    private readonly draftOrderUseCase;
    constructor(draftOrderUseCase: IDraftOrder);
    execute({ port: editOrderPayload, mongoTransactionSession, }: TransactionUseCasePort<EditOrderPayload>): Promise<DraftedOrder>;
    private editOrder;
}
