import { UUID } from '../../../common/domain';

export interface ReceivedByHostOrderProps {
  id: UUID;
  receivedByHostDate: Date;
}

export class ReceivedByHostOrder {
  static async receiveByHost(
    orderId: UUID,
    updateOrderReceiptDate: (
      toBeReceivedByHostOrderId: UUID,
      receivedByHostDate: Date,
    ) => Promise<unknown>,
  ): Promise<Date> {
    const receivedByHostDate: Date = new Date();

    await updateOrderReceiptDate(orderId, receivedByHostDate);

    return receivedByHostDate;
  }
}
