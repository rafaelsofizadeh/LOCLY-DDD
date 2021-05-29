import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import {
  IDraftOrder,
  DraftOrderRequest,
  DraftOrderPayload,
} from './application/DraftOrder/IDraftOrder';
import {
  ConfirmOrderRequest,
  IConfirmOrder,
  ConfirmOrderPayload,
  ConfirmOrderResult,
} from './application/ConfirmOrder/IConfirmOrder';
import {
  ReceiveItemResult,
  IReceiveItem,
  ReceiveItemRequest,
  ReceiveItemPayload,
} from './application/ReceiveItem/IReceiveItem';
import { DraftedOrder } from './entity/Order';
import {
  IEditOrder,
  EditOrderRequest,
  EditOrderPayload,
} from './application/EditOrder/IEditOrder';
import {
  DeleteOrderPayload,
  DeleteOrderRequest,
  DeleteOrderResult,
  IDeleteOrder,
} from './application/DeleteOrder/IDeleteOrder';
import {
  AddItemPhotoPayload,
  AddItemPhotoRequest,
  IAddItemPhoto,
} from './application/AddItemPhoto/IAddItemPhoto';
import { Photo } from './persistence/OrderMongoMapper';
import {
  SubmitShipmentInfoRequest,
  SubmitShipmentInfoResult,
  ISubmitShipmentInfo,
  SubmitShipmentInfoPayload,
} from './application/SubmitShipmentInfo/ISubmitShipmentInfo';
import {
  IPayShipment,
  PayShipmentPayload,
  PayShipmentRequest,
  PayShipmentResult,
} from './application/PayShipment/IPayShipment';
import {
  CustomerIdentity,
  VerifiedHostIdentity,
} from '../auth/infrastructure/decorators/identity';
import { UUID } from '../common/domain';
import { Host } from '../host/entity/Host';

@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrder: IDraftOrder,
    private readonly editOrder: IEditOrder,
    private readonly deleteOrder: IDeleteOrder,
    private readonly confirmOrder: IConfirmOrder,
    private readonly receiveItem: IReceiveItem,
    private readonly addItemPhoto: IAddItemPhoto,
    private readonly submitShipmentInfo: ISubmitShipmentInfo,
    private readonly payShipment: IPayShipment,
  ) {}

  @Post()
  async draftOrderHandler(
    @Body() unidDraftOrderRequest: DraftOrderRequest,
    @CustomerIdentity() customerId: UUID,
  ): Promise<DraftedOrder> {
    // TODO: Decorator for attaching identity id to request
    const draftOrderPayload: DraftOrderPayload = {
      ...unidDraftOrderRequest,
      customerId,
    };

    const draftOrder: DraftedOrder = await this.draftOrder.execute(
      draftOrderPayload,
    );

    return draftOrder;
  }

  @Patch()
  async editOrderHandler(
    @Body() unidEditOrderRequest: EditOrderRequest,
    @CustomerIdentity() customerId: UUID,
  ): Promise<DraftedOrder> {
    const editOrderPayload: EditOrderPayload = {
      ...unidEditOrderRequest,
      customerId,
    };

    const editedDraftOrder: DraftedOrder = await this.editOrder.execute(
      editOrderPayload,
    );

    return editedDraftOrder;
  }

  @Delete()
  async deleteOrderHandler(
    @Body() unidDeleteOrderRequest: DeleteOrderRequest,
    @CustomerIdentity() customerId: UUID,
  ): Promise<DeleteOrderResult> {
    const deleteOrderPayload: DeleteOrderPayload = {
      ...unidDeleteOrderRequest,
      customerId,
    };

    await this.deleteOrder.execute(deleteOrderPayload);
  }

  @Post('confirm')
  async confirmOrderHandler(
    @Body() unidConfirmaOrderRequest: ConfirmOrderRequest,
    @CustomerIdentity() customerId: UUID,
  ): Promise<ConfirmOrderResult> {
    const confirmOrderPayload: ConfirmOrderPayload = {
      ...unidConfirmaOrderRequest,
      customerId,
    };

    const stripeCheckoutSession = await this.confirmOrder.execute(
      confirmOrderPayload,
    );

    return stripeCheckoutSession;
  }

  @Post('receiveItem')
  async receiveItemHandler(
    @Body() unidReceiveItemRequest: ReceiveItemRequest,
    @VerifiedHostIdentity() { id: hostId }: Host,
  ): Promise<ReceiveItemResult> {
    const receiveItemPayload: ReceiveItemPayload = {
      ...unidReceiveItemRequest,
      hostId,
    };

    const receivedDateResult = await this.receiveItem.execute(
      receiveItemPayload,
    );

    return receivedDateResult;
  }

  @Post('addItemPhotos')
  // file control/validation is done by MulterModule registration
  @UseInterceptors(FilesInterceptor('photos'))
  async addItemPhotoHandler(
    @Body() unidAddItemPhotoRequest: AddItemPhotoRequest,
    @UploadedFiles() photos: Photo[],
    @VerifiedHostIdentity() { id: hostId }: Host,
  ) {
    const addItemPhotoPayload: AddItemPhotoPayload = {
      ...unidAddItemPhotoRequest,
      hostId,
      photos,
    };

    const receivedDateResult = await this.addItemPhoto.execute({
      ...addItemPhotoPayload,
    });

    return receivedDateResult;
  }

  @Post('submitShipmentInfo')
  async submitShipmentInfoHandler(
    @Body() unidSubmitShipmentInfoRequest: SubmitShipmentInfoRequest,
    @VerifiedHostIdentity() { id: hostId }: Host,
  ): Promise<SubmitShipmentInfoResult> {
    const submitShipmentInfoPayload: SubmitShipmentInfoPayload = {
      ...unidSubmitShipmentInfoRequest,
      hostId,
    };

    await this.submitShipmentInfo.execute(submitShipmentInfoPayload);
  }

  @Post('payShipment')
  async payShipmentHandler(
    @Body() unidPayShipmentRequest: PayShipmentRequest,
    @CustomerIdentity() customerId: UUID,
  ): Promise<PayShipmentResult> {
    const payShipmentPayload: PayShipmentPayload = {
      ...unidPayShipmentRequest,
      customerId,
    };

    const stripeCheckoutSession = await this.payShipment.execute(
      payShipmentPayload,
    );

    return stripeCheckoutSession;
  }
}
