import { UseCase } from '../../../common/application';
import { Email, UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';
export interface GetCustomerPayload {
    readonly customerId?: UUID;
    readonly email?: Email;
}
export declare abstract class IGetCustomer extends UseCase<GetCustomerPayload, Customer> {
}
