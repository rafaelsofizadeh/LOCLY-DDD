import { UseCase } from '../../../common/application';
import { Address, UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../entity/Customer';
export declare type EditCustomerPayload = {
    customerId: UUID;
    firstName?: string;
    lastName?: string;
    addresses?: Address[];
};
export declare class EditCustomerRequest implements UnidCustomerRequest<EditCustomerPayload> {
    firstName?: string;
    lastName?: string;
    addresses: Address[];
}
export declare abstract class IEditCustomer extends UseCase<EditCustomerPayload, void> {
}
