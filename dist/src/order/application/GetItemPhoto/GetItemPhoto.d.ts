import { Collection } from 'mongodb';
import { TransactionUseCasePort } from '../../../common/application';
import { FileUploadChunkMongoDocument, FileUploadMongoDocument } from '../../persistence/OrderMongoMapper';
import { IGetOrder } from '../GetOrder/IGetOrder';
import { GetItemPhotoPayload, GetItemPhotoResult, IGetItemPhoto } from './IGetItemPhoto';
export declare class GetItemPhoto implements IGetItemPhoto {
    private readonly getOrder;
    private readonly photoFileCollection;
    private readonly photoChunkCollection;
    constructor(getOrder: IGetOrder, photoFileCollection: Collection<FileUploadMongoDocument>, photoChunkCollection: Collection<FileUploadChunkMongoDocument>);
    execute({ port: getItemPhotoPayload, mongoTransactionSession, }: TransactionUseCasePort<GetItemPhotoPayload>): Promise<GetItemPhotoResult>;
}
