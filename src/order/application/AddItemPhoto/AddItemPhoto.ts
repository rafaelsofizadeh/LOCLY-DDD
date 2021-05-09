import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../persistence/OrderRepository';
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
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    addItemPhotoRequest: AddItemPhotoRequest,
    session?: ClientSession,
  ): Promise<ItemPhotosUploadResult> {
    const itemPhotoUploadResults = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.uploadItemPhoto(addItemPhotoRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );

    return itemPhotoUploadResults;
  }

  private uploadItemPhoto(
    { orderId, hostId, itemId, photos }: AddItemPhotoRequest,
    session: ClientSession,
  ): Promise<ItemPhotosUploadResult> {
    return this.orderRepository.addItemPhotos(
      {
        orderId,
        status: [OrderStatus.Confirmed, OrderStatus.Finalized],
        hostId,
      },
      { itemId },
      photos,
      session,
    );
  }
}
