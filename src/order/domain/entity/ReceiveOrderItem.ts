import { UUID } from '../../../common/domain';

export class ReceiveOrderItem {
  static async receive(
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
}
