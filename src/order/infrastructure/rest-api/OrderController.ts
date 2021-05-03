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
import { DraftOrder } from '../../domain/entity/DraftOrder';
import { SerializePrivatePropertiesInterceptor } from './nest-infrastructure/SerializePrivatePropertiesInterceptor';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { EditOrderRequestAdapter } from './request-adapters/EditOrderRequestAdapter';
import { DeleteOrderUseCase } from '../../domain/use-case/DeleteOrderUseCase';
import { DeleteOrderRequestAdapter } from './request-adapters/DeleteOrderRequestAdapter';
import { AddItemInfoRequestDataAdapter } from './request-adapters/AddItemInfoRequestAdapter';
import { AddItemInfoUseCase } from '../../domain/use-case/AddItemInfoUseCase';

@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly editOrderUseCase: EditOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly preConfirmOrderUseCase: PreConfirmOrderUseCase,
    private readonly receiveOrderItemUseCase: ReceiveOrderItemUseCase, // private readonly addItemInfoUseCase: AddItemInfoUseCase,
  ) {}

  @Post('draft')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async draftOrder(
    @Body() orderRequest: DraftOrderRequestAdapter,
  ): Promise<DraftOrder> {
    const draftOrder: DraftOrder = await this.draftOrderUseCase.execute(
      orderRequest,
    );

    return draftOrder;
  }

  @Post('edit')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async editOrder(
    @Body() editOrderRequest: EditOrderRequestAdapter,
  ): Promise<DraftOrder> {
    const editedDraftOrder: DraftOrder = await this.editOrderUseCase.execute(
      editOrderRequest,
    );

    return editedDraftOrder;
  }

  @Post('delete')
  async deleteOrder(
    @Body() deleteOrderRequest: DeleteOrderRequestAdapter,
  ): Promise<void> {
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
  /*
  @Post('addItemInfo')
  @UseInterceptors(FilesInterceptor('photos'))
  async addItemInfo(
    @Body() addItemInfoRequestData: AddItemInfoRequestDataAdapter,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    const receivedDateResult = await this.addItemInfoUseCase.execute({
      ...addItemInfoRequestData,
      photos,
    });

    return receivedDateResult;
  }*/
}
