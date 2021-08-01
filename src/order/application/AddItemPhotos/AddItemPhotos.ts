import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import {
  AddItemPhotoPayload,
  IAddItemPhotos,
  ItemPhotosUploadResult,
} from './IAddItemPhotos';
import { OrderStatus } from '../../entity/Order';

@Injectable()
export class AddItemPhotos implements IAddItemPhotos {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: addItemPhotoPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<AddItemPhotoPayload>): Promise<
    ItemPhotosUploadResult
  > {
    const itemPhotoUploadResults = await this.uploadItemPhoto(
      addItemPhotoPayload,
      mongoTransactionSession,
    );

    return itemPhotoUploadResults;
  }

  private uploadItemPhoto(
    { orderId, hostId, itemId, photos }: AddItemPhotoPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<ItemPhotosUploadResult> {
    // addItemPhotos() requires the item to be marked as received (i.e. have a receivedDate)
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
