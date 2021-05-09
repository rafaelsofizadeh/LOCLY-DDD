import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import {
  DraftOrderUseCase,
  DraftOrderRequest,
} from './application/DraftOrder/IDraftOrder';
import { ConfirmOrderRequest } from './application/ConfirmOrder/IConfirmOrder';
import {
  StripeCheckoutSessionResult,
  IConfirmOrder,
} from './application/ConfirmOrder/IConfirmOrder';
import { ReceiveItemRequestAdapter } from './application/ReceiveItem/ReceiveItemRequestAdapter';
import {
  ReceiveItemResult,
  ReceiveItemUseCase,
} from './application/ReceiveItem/ReceiveItemUseCase';
import { DraftedOrder } from './entity/Order';
import { SerializePrivatePropertiesInterceptor } from '../infrastructure/SerializePrivatePropertiesInterceptor';
import { EditOrderUseCase } from './application/EditOrder/IEditOrder';
import { EditOrderRequestAdapter } from './application/EditOrder/IEditOrder';
import {
  DeleteOrderResult,
  IDeleteOrder,
} from './application/DeleteOrder/IDeleteOrder';
import { DeleteOrderRequest } from './application/DeleteOrder/IDeleteOrder';
import { AddItemPhotoRequestBody } from './application/AddItemPhoto/IAddItemPhoto';
import {
  AddItemPhotoUseCase,
  photoPropertyName,
} from './application/AddItemPhoto/IAddItemPhoto';
import { Photo } from './persistence/OrderMongoMapper';
import { SubmitShipmentInfoRequestAdapter } from './application/SubmitShipmentInfo/SubmitShipmentInfoRequestAdapter';
import {
  SubmitShipmentInfoResult,
  SubmitShipmentInfoUseCase,
} from './application/SubmitShipmentInfo/SubmitShipmentInfoUseCase';
import { PayShipmentRequestAdapter } from './application/PayShipment/PayShipmentRequestAdapter';
import { PayShipmentUseCase } from './application/PayShipment/PayShipmentUseCase';

@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly editOrderUseCase: EditOrderUseCase,
    private readonly deleteOrder: IDeleteOrder,
    private readonly confirmOrder: IConfirmOrder,
    private readonly receiveItemUseCase: ReceiveItemUseCase,
    private readonly addItemPhotoUseCase: AddItemPhotoUseCase,
    private readonly submitShipmentInfoUseCase: SubmitShipmentInfoUseCase,
    private readonly payShipmentUseCase: PayShipmentUseCase,
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
    @Body() receiveItemRequest: ReceiveItemRequestAdapter,
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
    @Body() submitOrderShipmentInfoRequest: SubmitShipmentInfoRequestAdapter,
  ): Promise<SubmitShipmentInfoResult> {
    await this.submitShipmentInfoUseCase.execute(
      submitOrderShipmentInfoRequest,
    );
  }

  @Post('payShipment')
  async payShipmentHandler(
    @Body() payShipmentRequest: PayShipmentRequestAdapter,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.payShipmentUseCase.execute(
      payShipmentRequest,
    );

    return stripeCheckoutSession;
  }
}
