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
  EditOrderRequestAdapter,
} from './application/EditOrder/IEditOrder';
import {
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

@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: IDraftOrder,
    private readonly editOrderUseCase: IEditOrder,
    private readonly deleteOrder: IDeleteOrder,
    private readonly confirmOrder: IConfirmOrder,
    private readonly receiveItemUseCase: IReceiveItem,
    private readonly addItemPhotoUseCase: IAddItemPhoto,
    private readonly submitShipmentInfoUseCase: ISubmitShipmentInfo,
    private readonly payShipmentUseCase: IPayShipment,
  ) {}

  @Post('draft')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async draftOrderHandler(
    @Body() orderRequest: DraftOrderRequest,
  ): Promise<DraftedOrder> {
    const draftOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      orderRequest,
    );

    return draftOrder;
  }

  @Post('edit')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async editOrderHandler(
    @Body() editOrderRequest: EditOrderRequestAdapter,
  ): Promise<DraftedOrder> {
    const editedDraftOrder: DraftedOrder = await this.editOrderUseCase.execute(
      editOrderRequest,
    );

    return editedDraftOrder;
  }

  @Post('delete')
  async deleteOrderHandler(
    @Body() deleteOrderRequest: DeleteOrderRequest,
  ): Promise<DeleteOrderResult> {
    await this.deleteOrder.execute(deleteOrderRequest);
  }

  @Post('confirm')
  async confirmOrderHandler(
    @Body() confirmationRequest: ConfirmOrderRequest,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.confirmOrder.execute(
      confirmationRequest,
    );

    return stripeCheckoutSession;
  }

  @Post('receiveItem')
  async receiveItemHandler(
    @Body() receiveItemRequest: ReceiveItemRequest,
  ): Promise<ReceiveItemResult> {
    const receivedDateResult = await this.receiveItemUseCase.execute(
      receiveItemRequest,
    );

    return receivedDateResult;
  }

  @Post('addItemPhotos')
  // file control/validation is done by MulterModule registration
  @UseInterceptors(FilesInterceptor(photoPropertyName))
  async addItemPhotoHandler(
    @Body() addItemPhotoRequestBody: AddItemPhotoRequestBody,
    @UploadedFiles() photos: Photo[],
  ) {
    const receivedDateResult = await this.addItemPhotoUseCase.execute({
      ...addItemPhotoRequestBody,
      photos,
    });

    return receivedDateResult;
  }

  @Post('submitShipmentInfo')
  async submitOrderShipmentInfoHandler(
    @Body() submitOrderShipmentInfoRequest: SubmitShipmentInfoRequest,
  ): Promise<SubmitShipmentInfoResult> {
    await this.submitShipmentInfoUseCase.execute(
      submitOrderShipmentInfoRequest,
    );
  }

  @Post('payShipment')
  async payShipmentHandler(
    @Body() payShipmentRequest: PayShipmentRequest,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.payShipmentUseCase.execute(
      payShipmentRequest,
    );

    return stripeCheckoutSession;
  }
}
