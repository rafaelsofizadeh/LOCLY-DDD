import { UUID } from '../common/domain';
import { AddReferralCodeRequest, IAddReferralCode } from './application/AddReferralCode/IAddReferralCode';
import { IDeleteCustomer } from './application/DeleteCustomer/IDeleteCustomer';
import { EditCustomerRequest, IEditCustomer } from './application/EditCustomer/IEditCustomer';
import { IGetCustomer } from './application/GetCustomer/IGetCustomer';
import { SerializedCustomer } from './entity/Customer';
export declare class CustomerController {
    private readonly getCustomer;
    private readonly editCustomer;
    private readonly addReferralCode;
    private readonly deleteCustomer;
    constructor(getCustomer: IGetCustomer, editCustomer: IEditCustomer, addReferralCode: IAddReferralCode, deleteCustomer: IDeleteCustomer);
    getCustomerController(customerId: UUID): Promise<SerializedCustomer>;
    addReferralCodeController(customerId: UUID, addReferralCodeRequest: AddReferralCodeRequest): Promise<void>;
    editCustomerController(customerId: UUID, editOrderRequest: EditCustomerRequest): Promise<void>;
    deleteCustomerController(customerId: UUID): Promise<void>;
}
