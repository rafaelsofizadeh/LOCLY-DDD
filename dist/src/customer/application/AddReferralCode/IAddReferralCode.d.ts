import { Customer, UnidCustomerRequest } from '../../../customer/entity/Customer';
import { UseCase } from '../../../common/application';
export declare type AddReferralCodePayload = Readonly<{
    customerId: Customer['id'];
    refereeCode: string;
}>;
export declare class AddReferralCodeRequest implements UnidCustomerRequest<AddReferralCodePayload> {
    refereeCode: string;
}
export declare abstract class IAddReferralCode extends UseCase<AddReferralCodePayload, void> {
}
