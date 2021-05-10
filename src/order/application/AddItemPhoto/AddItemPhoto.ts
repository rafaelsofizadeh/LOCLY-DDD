import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  AddItemPhotoRequest,
  IAddItemPhoto,
  ItemPhotosUploadResult,
} from './IAddItemPhoto';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class AddItemPhoto implements IAddItemPhoto {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    addItemPhotoRequest: AddItemPhotoRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<ItemPhotosUploadResult> {
    const itemPhotoUploadResults = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.uploadItemPhoto(addItemPhotoRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return itemPhotoUploadResults;
  }

  private uploadItemPhoto(
    { orderId, hostId, itemId, photos }: AddItemPhotoRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<ItemPhotosUploadResult> {
    return this.orderRepository.addItemPhotos(
      {
        orderId,
        status: [OrderStatus.Confirmed, OrderStatus.Finalized],
        hostId,
      },
      { itemId },
      photos,
      mongoTransactionSession,
    );
  }
}
