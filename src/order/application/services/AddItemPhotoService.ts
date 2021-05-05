import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { UUID } from '../../../common/domain';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  AddItemPhotoRequest,
  AddItemPhotoUseCase,
  ItemPhotosUploadResult,
} from '../../domain/use-case/AddItemPhotoUseCase';
import { Item } from '../../domain/entity/Item';
import { Photo } from '../../infrastructure/persistence/order/OrderMongoMapper';

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
    return Item.uploadPhoto(
      orderId,
      hostId,
      itemId,
      photos,
      (
        itemContainedOrderId: UUID,
        orderAssigneeHostId: UUID,
        toBeUploadedPhotoItemId: UUID,
        uploadedPhotos: Photo[],
      ) =>
        this.orderRepository.addItemPhotos(
          { id: itemContainedOrderId, hostId: orderAssigneeHostId },
          { id: toBeUploadedPhotoItemId },
          uploadedPhotos,
          session,
        ),
    );
  }
}
