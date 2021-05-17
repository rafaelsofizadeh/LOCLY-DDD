import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import {
  IDraftOrder,
  DraftOrderRequest,
} from './application/DraftOrder/IDraftOrder';
import {
  ConfirmOrderRequest,
  StripeCheckoutSessionResult,
  IConfirmOrder,
} from './application/ConfirmOrder/IConfirmOrder';
import {
  ReceiveItemResult,
  IReceiveItem,
  ReceiveItemRequest,
} from './application/ReceiveItem/IReceiveItem';
import { DraftedOrder } from './entity/Order';
import { SerializePrivatePropertiesInterceptor } from '../infrastructure/SerializePrivatePropertiesInterceptor';
import {
  IEditOrder,
  EditOrderRequest,
} from './application/EditOrder/IEditOrder';
import {
  DeleteOrderPayload,
  DeleteOrderRequest,
  DeleteOrderResult,
  IDeleteOrder,
} from './application/DeleteOrder/IDeleteOrder';
import {
  AddItemPhotoRequestBody,
  IAddItemPhoto,
  photoPropertyName,
} from './application/AddItemPhoto/IAddItemPhoto';
import { Photo } from './persistence/OrderMongoMapper';
import {
  SubmitShipmentInfoRequest,
  SubmitShipmentInfoResult,
  ISubmitShipmentInfo,
} from './application/SubmitShipmentInfo/ISubmitShipmentInfo';
import {
  IPayShipment,
  PayShipmentRequest,
} from './application/PayShipment/IPayShipment';
import { AuthzScope, Identity } from '@rafaelsofizadeh/nestjs-auth/dist';
import { EntityToken } from '../auth/entity/Token';

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

  @Post('draft')
  @AuthzScope('order/customer')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async draftOrderHandler(
    @Body() unidDraftOrderRequest: DraftOrderRequest,
    @Identity() customerIdentity: EntityToken,
  ): Promise<DraftedOrder> {
    // TODO: Decorator for attaching identity id to request
    const draftOrderRequest = {
      ...unidDraftOrderRequest,
      customerId: customerIdentity.entityId,
    };

    const draftOrder: DraftedOrder = await this.draftOrder.execute(
      draftOrderRequest,
    );

    return draftOrder;
  }

  @Post('edit')
  @AuthzScope('order/customer')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async editOrderHandler(
    @Body() unidEditOrderRequest: EditOrderRequest,
    @Identity() customerIdentity: EntityToken,
  ): Promise<DraftedOrder> {
    const editOrderRequest = {
      ...unidEditOrderRequest,
      customerId: customerIdentity.entityId,
    };

    const editedDraftOrder: DraftedOrder = await this.editOrder.execute(
      editOrderRequest,
    );

    return editedDraftOrder;
  }

  @Post('delete')
  @AuthzScope('order/customer')
  async deleteOrderHandler(
    @Body() unidDeleteOrderRequest: DeleteOrderRequest,
    @Identity() customerIdentity: EntityToken,
  ): Promise<DeleteOrderResult> {
    const deleteOrderRequest = {
      ...unidDeleteOrderRequest,
      customerId: customerIdentity.entityId,
    };

    await this.deleteOrder.execute(deleteOrderRequest);
  }

  @Post('confirm')
  @AuthzScope('order/customer')
  async confirmOrderHandler(
    @Body() unidConfirmaOrderRequest: ConfirmOrderRequest,
    @Identity() customerIdentity: EntityToken,
  ): Promise<StripeCheckoutSessionResult> {
    const confirmOrderRequest = {
      ...unidConfirmaOrderRequest,
      customerId: customerIdentity.entityId,
    };

    const stripeCheckoutSession = await this.confirmOrder.execute(
      confirmOrderRequest,
    );

    return stripeCheckoutSession;
  }

  @Post('receiveItem')
  @AuthzScope('order/host')
  async receiveItemHandler(
    @Body() receiveItemRequest: ReceiveItemRequest,
  ): Promise<ReceiveItemResult> {
    const receivedDateResult = await this.receiveItem.execute(
      receiveItemRequest,
    );

    return receivedDateResult;
  }

  @Post('addItemPhotos')
  @AuthzScope('order/host')
  // file control/validation is done by MulterModule registration
  @UseInterceptors(FilesInterceptor(photoPropertyName))
  async addItemPhotoHandler(
    @Body() addItemPhotoRequestBody: AddItemPhotoRequestBody,
    @UploadedFiles() photos: Photo[],
  ) {
    const receivedDateResult = await this.addItemPhoto.execute({
      ...addItemPhotoRequestBody,
      photos,
    });

    return receivedDateResult;
  }

  @Post('submitShipmentInfo')
  @AuthzScope('order/host')
  async submitOrderShipmentInfoHandler(
    @Body() submitOrderShipmentInfoRequest: SubmitShipmentInfoRequest,
  ): Promise<SubmitShipmentInfoResult> {
    await this.submitShipmentInfo.execute(submitOrderShipmentInfoRequest);
  }

  @Post('payShipment')
  @AuthzScope('order/customer')
  async payShipmentHandler(
    @Body() unidPayShipmentRequest: PayShipmentRequest,
    @Identity() customerIdentity: EntityToken,
  ): Promise<StripeCheckoutSessionResult> {
    const payShipmentRequest = {
      ...unidPayShipmentRequest,
      customerId: customerIdentity.entityId,
    };

    const stripeCheckoutSession = await this.payShipment.execute(
      payShipmentRequest,
    );

    return stripeCheckoutSession;
  }
}
