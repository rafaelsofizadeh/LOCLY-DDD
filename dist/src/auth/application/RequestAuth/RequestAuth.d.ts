import { TransactionUseCasePort } from '../../../common/application';
import { RequestAuthPayload, RequestAuthResult, IRequestAuth } from './IRequestAuth';
import { IGetCustomerUpsert } from '../../../customer/application/GetCustomerUpsert/IGetCustomerUpsert';
import { IGetHostUpsert } from '../../../host/application/GetHostUpsert/IGetHostUpsert';
import { INotificationService } from '../../../infrastructure/notification/INotificationService';
export declare class RequestAuth implements IRequestAuth {
    private readonly getCustomerUpsert;
    private readonly getHostUpsert;
    private readonly notificationService;
    constructor(getCustomerUpsert: IGetCustomerUpsert, getHostUpsert: IGetHostUpsert, notificationService: INotificationService);
    execute({ port: requestAuthPayload, mongoTransactionSession, }: TransactionUseCasePort<RequestAuthPayload>): Promise<RequestAuthResult>;
    private requestAuth;
    private findOrCreateEntity;
}
