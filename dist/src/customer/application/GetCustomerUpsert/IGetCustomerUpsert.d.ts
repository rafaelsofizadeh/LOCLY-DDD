import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';
export declare type GetCustomerUpsertPayload = Readonly<{
    email: UUID;
}>;
export declare type GetCustomerUpsertResult = {
    customer: Customer;
    upsert: boolean;
};
export declare abstract class IGetCustomerUpsert extends UseCase<GetCustomerUpsertPayload, GetCustomerUpsertResult> {
}
