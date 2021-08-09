import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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
import { DraftedOrder, Order } from './entity/Order';
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
  IAddItemPhotos,
} from './application/AddItemPhotos/IAddItemPhotos';
import { FileUpload, FileUploadResult } from './persistence/OrderMongoMapper';
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
  AnyEntityIdentity,
  AnyIdentity,
  CustomerIdentity,
  VerifiedHostIdentity,
} from '../auth/infrastructure/IdentityDecorator';
import { isUUID, UUID } from '../common/domain';
import { Host } from '../host/entity/Host';
import { UserType } from '../auth/entity/Token';
import { GetOrderResult, IGetOrder } from './application/GetOrder/IGetOrder';
import { EstimateShipmentCostRequest } from './application/EstimateShipmentCost/IEstimateShipmentCost';
import {
  getShipmentCostQuote,
  ShipmentCostQuote,
} from '../calculator/getShipmentCostQuote';
import {
  GetItemPhotoResult,
  IGetItemPhoto,
} from './application/GetItemPhoto/IGetItemPhoto';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { throwCustomException } from '../common/error-handling';

@Controller('order')
export class OrderController {
  constructor(
    private readonly getOrder: IGetOrder,
    private readonly getItemPhoto: IGetItemPhoto,
    private readonly draftOrder: IDraftOrder,
    private readonly editOrder: IEditOrder,
    private readonly deleteOrder: IDeleteOrder,
    private readonly confirmOrder: IConfirmOrder,
    private readonly receiveItem: IReceiveItem,
    private readonly addItemPhotos: IAddItemPhotos,
    private readonly submitShipmentInfo: ISubmitShipmentInfo,
    private readonly payShipment: IPayShipment,
  ) {}

  @Get('shipmentCost')
  estimateShipmentCostHandler(
    @Query()
    {
      originCountry,
      destinationCountry,
      totalWeight,
    }: EstimateShipmentCostRequest,
    @AnyIdentity() identity: any,
  ): ShipmentCostQuote {
    return getShipmentCostQuote(originCountry, destinationCountry, totalWeight);
  }

  @Get(':orderId')
  async getOrderHandler(
    @Param('orderId') orderId: UUID,
    @AnyEntityIdentity() entity: Host | UUID,
  ): Promise<GetOrderResult> {
    // TODO: Better way to determine user type
    const userFilter = isUUID(entity)
      ? { userId: entity, userType: UserType.Customer }
      : { userId: entity.id, userType: UserType.Host };

    return this.getOrder.execute({ port: { orderId, ...userFilter } });
  }

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

    const draftOrder: DraftedOrder = await this.draftOrder.execute({
      port: draftOrderPayload,
    });

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

    const editedDraftOrder: DraftedOrder = await this.editOrder.execute({
      port: editOrderPayload,
    });

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

    await this.deleteOrder.execute({ port: deleteOrderPayload });
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

    const stripeCheckoutSession = await this.confirmOrder.execute({
      port: confirmOrderPayload,
    });

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

    const receivedDateResult = await this.receiveItem.execute({
      port: receiveItemPayload,
    });

    return receivedDateResult;
  }

  @Post('itemPhotos')
  // file control/validation is done by MulterModule registration
  @UseInterceptors(FilesInterceptor('photos'))
  async addItemPhotoHandler(
    @Body() { payload: unidAddItemPhotoRequestJson }: { payload: string },
    @UploadedFiles() photos: FileUpload[],
    @VerifiedHostIdentity() { id: hostId }: Host,
  ) {
    const unidAddItemPhotoRequest: AddItemPhotoRequest = plainToClass(
      AddItemPhotoRequest,
      JSON.parse(unidAddItemPhotoRequestJson),
    );

    await validateOrReject(unidAddItemPhotoRequest).catch(
      throwCustomException('Error adding item photos: '),
    );

    if (!photos || !photos.length) {
      throwCustomException(
        'Photo files must be submitted.',
        {},
        HttpStatus.BAD_REQUEST,
      )();
    }

    const addItemPhotoPayload: AddItemPhotoPayload = {
      ...unidAddItemPhotoRequest,
      hostId,
      photos,
    };

    const receivedDateResult = await this.addItemPhotos.execute({
      port: {
        ...addItemPhotoPayload,
      },
    });

    return receivedDateResult;
  }

  @Get(':orderId/item/:itemId/photo/:photoId')
  async getItemPhotoHandler(
    @Param('orderId') orderId: UUID,
    @Param('itemId') itemId: UUID,
    @Param('photoId') photoId: UUID,
    @AnyEntityIdentity() entity: Host | UUID,
  ): Promise<GetItemPhotoResult> {
    // TODO: Better way to determine user type
    const userFilter = isUUID(entity)
      ? { userId: entity, userType: UserType.Customer }
      : { userId: entity.id, userType: UserType.Host };

    return this.getItemPhoto.execute({
      port: { orderId, itemId, photoId, ...userFilter },
    });
  }

  // TODO(NOW): Add stripePaymentIntentId to order
  @Post('shipmentInfo')
  // file control/validation is done by MulterModule registration
  @UseInterceptors(FileInterceptor('proofOfPayment'))
  async submitShipmentInfoHandler(
    @Body() { payload: unidSubmitShipmentInfoRequestJson }: { payload: string },
    @UploadedFile() proofOfPayment: FileUpload,
    @VerifiedHostIdentity() { id: hostId }: Host,
  ): Promise<SubmitShipmentInfoResult> {
    const unidSubmitShipmentInfoRequest: SubmitShipmentInfoRequest = plainToClass(
      SubmitShipmentInfoRequest,
      JSON.parse(unidSubmitShipmentInfoRequestJson),
    );

    await validateOrReject(unidSubmitShipmentInfoRequest).catch(
      throwCustomException('Error submitting shipment info: '),
    );

    if (!proofOfPayment) {
      throwCustomException(
        'A proof of payment file must be submitted.',
        {},
        HttpStatus.BAD_REQUEST,
      )();
    }

    const submitShipmentInfoPayload: SubmitShipmentInfoPayload = {
      ...unidSubmitShipmentInfoRequest,
      hostId,
      proofOfPayment,
    };

    const proofOfPaymentUpload: FileUploadResult = await this.submitShipmentInfo.execute(
      { port: submitShipmentInfoPayload },
    );

    return proofOfPaymentUpload;
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

    const stripeCheckoutSession = await this.payShipment.execute({
      port: payShipmentPayload,
    });

    return stripeCheckoutSession;
  }
}
