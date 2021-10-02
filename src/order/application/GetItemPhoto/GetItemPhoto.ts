import { HttpStatus, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import { uuidToMuuid } from '../../../common/persistence';
import {
  FileUploadChunkMongoDocument,
  FileUploadMongoDocument,
} from '../../persistence/OrderMongoMapper';
import { IGetOrder } from '../GetOrder/IGetOrder';
import {
  GetItemPhotoPayload,
  GetItemPhotoResult,
  IGetItemPhoto,
} from './IGetItemPhoto';

@Injectable()
export class GetItemPhoto implements IGetItemPhoto {
  constructor(
    private readonly getOrder: IGetOrder,
    @InjectCollection('host_item_photos.files')
    private readonly photoFileCollection: Collection<FileUploadMongoDocument>,
    @InjectCollection('host_item_photos.chunks')
    private readonly photoChunkCollection: Collection<
      FileUploadChunkMongoDocument
    >,
  ) {}

  @Transaction
  async execute({
    port: getItemPhotoPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<GetItemPhotoPayload>): Promise<GetItemPhotoResult> {
    const order = await this.getOrder.execute({ port: getItemPhotoPayload });
    const item = order.items.find(
      ({ id }) => id === getItemPhotoPayload.itemId,
    );
    const photoId = item.photoIds.find(
      id => id === getItemPhotoPayload.photoId,
    );

    if (!photoId) {
      throwCustomException(
        'No photo found',
        getItemPhotoPayload,
        HttpStatus.NOT_FOUND,
      )();
    }

    const photoMuuid = uuidToMuuid(photoId);

    const {
      uploadDate,
      filename: fileName,
      contentType,
      _id: fileMuuid,
    }: FileUploadMongoDocument = await this.photoFileCollection
      .findOne({ _id: photoMuuid })
      .catch(
        throwCustomException(
          'No photo found',
          getItemPhotoPayload,
          HttpStatus.NOT_FOUND,
        ),
      );

    const photoChunks: FileUploadChunkMongoDocument[] = await this.photoChunkCollection
      .find({ files_id: fileMuuid })
      .toArray()
      .catch(throwCustomException('Error getting photo', getItemPhotoPayload));

    const fileData = photoChunks
      .map(chunk => chunk.data.buffer.toString('base64'))
      .join('');
    const finalFile = `data:${contentType};base64,${fileData}`;

    return {
      fileName,
      uploadDate,
      contentType,
      data: finalFile,
    };
  }
}
