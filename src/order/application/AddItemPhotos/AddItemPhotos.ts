import { HttpStatus, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import {
  AddItemPhotoPayload,
  IAddItemPhotos,
  AddItemPhotosResult,
} from './IAddItemPhotos';
import { OrderStatus } from '../../entity/Order';
import { throwCustomException } from '../../../common/error-handling';

@Injectable()
export class AddItemPhotos implements IAddItemPhotos {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: addItemPhotoPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<AddItemPhotoPayload>): Promise<
    AddItemPhotosResult
  > {
    const itemPhotoUploadResults = await this.uploadItemPhoto(
      addItemPhotoPayload,
      mongoTransactionSession,
    );

    return itemPhotoUploadResults;
  }

  private async uploadItemPhoto(
    { orderId, hostId, itemId, photos }: AddItemPhotoPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<AddItemPhotosResult> {
    const order = await this.orderRepository.findOrder(
      {
        orderId,
        status: [OrderStatus.Confirmed, OrderStatus.Finalized],
        hostId,
      },
      mongoTransactionSession,
    );
    const item = order.items.find(({ id }) => id === itemId);

    if (!item.receivedDate) {
      throwCustomException(
        'Item should be marked as received before uploading photos.',
        { orderId, itemId },
        HttpStatus.FORBIDDEN,
      )();
    }

    return this.orderRepository.addItemPhotos(
      { orderId },
      { itemId },
      photos,
      mongoTransactionSession,
    );
  }
}
