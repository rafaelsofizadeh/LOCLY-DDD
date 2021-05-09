import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { DraftOrderRequestAdapter } from './application/DraftOrder/DraftOrderRequestAdapter';
import { DraftOrderUseCase } from './application/DraftOrder/DraftOrderUseCase';
import { ConfirmOrderRequestAdapter } from './application/ConfirmOrder/ConfirmOrderRequestAdapter';
import {
  StripeCheckoutSessionResult,
  ConfirmOrderUseCase,
} from './application/ConfirmOrder/ConfirmOrderUseCase';
import { ReceiveItemRequestAdapter } from './application/ReceiveItem/ReceiveItemRequestAdapter';
import {
  ReceiveItemResult,
  ReceiveItemUseCase,
} from './application/ReceiveItem/ReceiveItemUseCase';
import { DraftedOrder } from './entity/Order';
import { SerializePrivatePropertiesInterceptor } from '../infrastructure/SerializePrivatePropertiesInterceptor';
import { EditOrderUseCase } from './application/EditOrder/EditOrderUseCase';
import { EditOrderRequestAdapter } from './application/EditOrder/EditOrderRequestAdapter';
import {
  DeleteOrderResult,
  DeleteOrderUseCase,
} from './application/DeleteOrder/DeleteOrderUseCase';
import { DeleteOrderRequestAdapter } from './application/DeleteOrder/DeleteOrderRequestAdapter';
import { AddItemPhotoRequestBodyAdapter } from './application/AddItemPhoto/AddItemPhotoRequestAdapter';
import {
  AddItemPhotoUseCase,
  photoPropertyName,
} from './application/AddItemPhoto/AddItemPhotoUseCase';
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
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly receiveItemUseCase: ReceiveItemUseCase,
    private readonly addItemPhotoUseCase: AddItemPhotoUseCase,
    private readonly submitShipmentInfoUseCase: SubmitShipmentInfoUseCase,
    private readonly payShipmentUseCase: PayShipmentUseCase,
  ) {}

  @Post('draft')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async draftOrder(
    @Body() orderRequest: DraftOrderRequestAdapter,
  ): Promise<DraftedOrder> {
    const draftOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      orderRequest,
    );

    return draftOrder;
  }

  @Post('edit')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async editOrder(
    @Body() editOrderRequest: EditOrderRequestAdapter,
  ): Promise<DraftedOrder> {
    const editedDraftOrder: DraftedOrder = await this.editOrderUseCase.execute(
      editOrderRequest,
    );

    return editedDraftOrder;
  }

  @Post('delete')
  async deleteOrder(
    @Body() deleteOrderRequest: DeleteOrderRequestAdapter,
  ): Promise<DeleteOrderResult> {
    await this.deleteOrderUseCase.execute(deleteOrderRequest);
  }

  @Post('confirm')
  async confirmOrder(
    @Body() confirmationRequest: ConfirmOrderRequestAdapter,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.confirmOrderUseCase.execute(
      confirmationRequest,
    );

    return stripeCheckoutSession;
  }

  @Post('receiveItem')
  async receiveItem(
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
  async addItemPhoto(
    @Body() addItemPhotoRequestBody: AddItemPhotoRequestBodyAdapter,
    @UploadedFiles() photos: Photo[],
  ) {
    const receivedDateResult = await this.addItemPhotoUseCase.execute({
      ...addItemPhotoRequestBody,
      photos,
    });

    return receivedDateResult;
  }

  @Post('submitShipmentInfo')
  async submitOrderShipmentInfo(
    @Body() submitOrderShipmentInfoRequest: SubmitShipmentInfoRequestAdapter,
  ): Promise<SubmitShipmentInfoResult> {
    await this.submitShipmentInfoUseCase.execute(
      submitOrderShipmentInfoRequest,
    );
  }

  @Post('payShipment')
  async payShipment(
    @Body() payShipmentRequest: PayShipmentRequestAdapter,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.payShipmentUseCase.execute(
      payShipmentRequest,
    );

    return stripeCheckoutSession;
  }
}
