import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { DraftOrderRequestAdapter } from './request-adapters/DraftOrderRequestAdapter';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { PreConfirmOrderRequestAdapter } from './request-adapters/PreConfirmOrderRequestAdapter';
import {
  StripeCheckoutSessionResult,
  PreConfirmOrderUseCase,
} from '../../domain/use-case/PreConfirmOrderUseCase';
import { ReceiveOrderItemRequestAdapter } from './request-adapters/ReceiveOrderItemRequestAdapter';
import {
  ReceiveOrderItemResult,
  ReceiveOrderItemUseCase,
} from '../../domain/use-case/ReceiveOrderItemUseCase';
import { DraftedOrder } from '../../domain/entity/Order';
import { SerializePrivatePropertiesInterceptor } from './nest-infrastructure/SerializePrivatePropertiesInterceptor';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { EditOrderRequestAdapter } from './request-adapters/EditOrderRequestAdapter';
import {
  DeleteOrderResult,
  DeleteOrderUseCase,
} from '../../domain/use-case/DeleteOrderUseCase';
import { DeleteOrderRequestAdapter } from './request-adapters/DeleteOrderRequestAdapter';
import { AddItemPhotoRequestBodyAdapter } from './request-adapters/AddItemPhotoRequestAdapter';
import {
  AddItemPhotoUseCase,
  photoPropertyName,
} from '../../domain/use-case/AddItemPhotoUseCase';
import { Photo } from '../persistence/order/OrderMongoMapper';
import { SubmitShipmentInfoRequestAdapter } from './request-adapters/SubmitShipmentInfoRequestAdapter';
import {
  SubmitShipmentInfoResult,
  SubmitShipmentInfoUseCase,
} from '../../domain/use-case/SubmitShipmentInfoUseCase';
import { PrePayOrderShipmentFeeRequestAdapter } from './request-adapters/PrePayOrderShipmentFeeRequestAdapter';
import { PrePayOrderShipmentFeeUseCase } from '../../domain/use-case/PrePayOrderShipmentFeeUseCase';

@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly editOrderUseCase: EditOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly preConfirmOrderUseCase: PreConfirmOrderUseCase,
    private readonly receiveOrderItemUseCase: ReceiveOrderItemUseCase,
    private readonly addItemPhotoUseCase: AddItemPhotoUseCase,
    private readonly submitShipmentInfoUseCase: SubmitShipmentInfoUseCase,
    private readonly prePayOrderShipmentFeeUseCase: PrePayOrderShipmentFeeUseCase,
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
  async preConfirmOrder(
    @Body() confirmationRequest: PreConfirmOrderRequestAdapter,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.preConfirmOrderUseCase.execute(
      confirmationRequest,
    );

    return stripeCheckoutSession;
  }

  @Post('receiveItem')
  async receiveOrderItem(
    @Body() receiveOrderItemRequest: ReceiveOrderItemRequestAdapter,
  ): Promise<ReceiveOrderItemResult> {
    const receivedDateResult = await this.receiveOrderItemUseCase.execute(
      receiveOrderItemRequest,
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

  @Post('payShipmentFee')
  async prePayOrderShipmentFee(
    @Body() prePayOrderShipmentFeeRequest: PrePayOrderShipmentFeeRequestAdapter,
  ): Promise<StripeCheckoutSessionResult> {
    const stripeCheckoutSession = await this.prePayOrderShipmentFeeUseCase.execute(
      prePayOrderShipmentFeeRequest,
    );

    return stripeCheckoutSession;
  }
}
