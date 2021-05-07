import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  AddItemPhotoRequest,
  AddItemPhotoUseCase,
  ItemPhotosUploadResult,
} from '../../domain/use-case/AddItemPhotoUseCase';
import { ConfirmedOrderStatus } from '../../domain/entity/Order';

@Injectable()
export class AddItemPhotoService implements AddItemPhotoUseCase {
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
      { orderId, status: ConfirmedOrderStatus, hostId },
      { itemId },
      photos,
      session,
    );
  }
}
