import { HttpStatus, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import {
  SubmitShipmentInfoPayload,
  ISubmitShipmentInfo,
  SubmitShipmentInfoResult,
} from './ISubmitShipmentInfo';
import { Order, OrderStatus } from '../../entity/Order';
import { throwCustomException } from '../../../common/error-handling';
import { UUID } from '../../../common/domain';
import { FileUploadResult } from '../../persistence/OrderMongoMapper';

enum UnfinalizedItemReason {
  NO_PHOTOS = 'no photos',
  NOT_RECEIVED = 'not received',
}

export type UnfinalizedItem = { id: UUID; reasons: UnfinalizedItemReason[] };

@Injectable()
export class SubmitShipmentInfo implements ISubmitShipmentInfo {
  constructor(private readonly orderRepository: IOrderRepository) {}

  @Transaction
  async execute({
    port: finalizeOrderRequest,
    mongoTransactionSession,
  }: TransactionUseCasePort<SubmitShipmentInfoPayload>): Promise<
    SubmitShipmentInfoResult
  > {
    const proofOfPaymentUpload: FileUploadResult = await this.finalizeOrder(
      finalizeOrderRequest,
      mongoTransactionSession,
    );

    return proofOfPaymentUpload;
  }

  private async finalizeOrder(
    {
      orderId,
      hostId,
      totalWeight,
      shipmentCost: finalShipmentCost,
      calculatorResultUrl,
      proofOfPayment,
    }: SubmitShipmentInfoPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<SubmitShipmentInfoResult> {
    const unfinalizedItems: UnfinalizedItem[] = await this.getUnfinalizedItems(
      orderId,
      hostId,
    );

    if (unfinalizedItems.length) {
      throwCustomException(
        "Can't finalize order until all items have uploaded photos and have been marked as 'received'",
        { orderId, unfinalizedItems },
        HttpStatus.FORBIDDEN,
      )();
    }

    await this.orderRepository.setProperties(
      // status and hostId are already checked in getUnfinalizedItems()
      { orderId },
      {
        totalWeight,
        finalShipmentCost,
        status: OrderStatus.Finalized,
        ...(calculatorResultUrl ? { calculatorResultUrl } : {}),
      },
      mongoTransactionSession,
    );

    return this.orderRepository.addFile(
      { orderId },
      proofOfPayment,
      mongoTransactionSession,
    );
  }

  private async getUnfinalizedItems(
    orderId: UUID,
    hostId: UUID,
  ): Promise<UnfinalizedItem[]> {
    const order: Order = await this.orderRepository.findOrder({
      orderId,
      status: OrderStatus.Confirmed,
      hostId,
    });

    const unfinalizedItems: UnfinalizedItem[] = order.items
      .map(({ id, receivedDate, photoIds }) => {
        const reasons: UnfinalizedItemReason[] = [];

        if (!receivedDate) {
          reasons.push(UnfinalizedItemReason.NOT_RECEIVED);
        }

        if (!photoIds?.length) {
          reasons.push(UnfinalizedItemReason.NO_PHOTOS);
        }

        return reasons.length ? { id, reasons } : undefined;
      })
      .filter(unfinalizedItem => Boolean(unfinalizedItem));

    return unfinalizedItems;
  }
}
