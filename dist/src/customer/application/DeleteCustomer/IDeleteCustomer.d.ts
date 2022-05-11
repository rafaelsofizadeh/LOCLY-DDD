import { Customer } from '../../../customer/entity/Customer';
import { UseCase } from '../../../common/application';
export declare type DeleteCustomerPayload = Readonly<{
    customerId: Customer['id'];
}>;
export declare type DeleteCustomerResult = void;
export declare abstract class IDeleteCustomer extends UseCase<DeleteCustomerPayload, DeleteCustomerResult> {
}
