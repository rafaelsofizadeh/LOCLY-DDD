import { IOrderRepository } from '../../persistence/IOrderRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { AddItemPhotoPayload, IAddItemPhotos, AddItemPhotosResult } from './IAddItemPhotos';
export declare class AddItemPhotos implements IAddItemPhotos {
    private readonly orderRepository;
    constructor(orderRepository: IOrderRepository);
    execute({ port: addItemPhotoPayload, mongoTransactionSession, }: TransactionUseCasePort<AddItemPhotoPayload>): Promise<AddItemPhotosResult>;
    private uploadItemPhoto;
}
