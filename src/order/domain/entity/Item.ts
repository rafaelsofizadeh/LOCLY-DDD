import { EntityFilter, WithoutId } from '../../../common/domain';
import { UUID } from '../../../common/domain';
import { Photo } from '../../infrastructure/persistence/order/OrderMongoMapper';
import { ItemPhotosUploadResult } from '../use-case/AddItemPhotoUseCase';

export type Gram = number;

export type PhysicalItemProps = {
  weight: Gram;
};

export interface ItemProps extends PhysicalItemProps {
  id: UUID;
  title: string;
  storeName: string;
  receivedDate?: Date;
}

export class Item implements ItemProps {
  readonly id: UUID;

  readonly title: string;

  readonly storeName: string;

  readonly weight: Gram;

  readonly receivedDate: Date;

  private constructor({
    id,
    title,
    storeName,
    weight,
    receivedDate,
  }: ItemProps) {
    this.id = id;
    this.title = title;
    this.storeName = storeName;
    this.weight = weight;
    this.receivedDate = receivedDate;
  }

  static fromData(payload: ItemProps) {
    return new this(payload);
  }

  static create(payload: WithoutId<ItemProps>) {
    return new this({ ...payload, id: UUID() });
  }

  static async beReceived(
    orderId: UUID,
    customerId: UUID,
    itemId: UUID,
    setOrderItemReceiptDate: (
      toBeReceivedOrderId: UUID,
      orderOwnerCustomerId: UUID,
      toBeReceivedOrderItemId: UUID,
      receivedDate: Date,
    ) => Promise<unknown>,
  ): Promise<Date> {
    const receivedDate: Date = new Date();

    await setOrderItemReceiptDate(orderId, customerId, itemId, receivedDate);

    return receivedDate;
  }

  static uploadPhoto(
    orderId: UUID,
    customerId: UUID,
    itemId: UUID,
    photos: Photo[],
    uploadPhoto: (
      itemContainedOrderId: UUID,
      orderAssigneeHostId: UUID,
      toBeUploadedPhotoItemId: UUID,
      uploadedPhotos: Photo[],
    ) => Promise<ItemPhotosUploadResult>,
  ) {
    return uploadPhoto(orderId, customerId, itemId, photos);
  }
}

export type ItemFilter = EntityFilter<ItemProps>;
