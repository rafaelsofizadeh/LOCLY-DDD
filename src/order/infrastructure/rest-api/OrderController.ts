import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { DraftOrderRequestAdapter } from './DraftOrderRequestAdapter';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { ConfirmOrderRequestAdapter } from './ConfirmOrderRequestAdapter';
import {
  StripeCheckoutSession,
  ConfirmOrderUseCase,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { ReceiveOrderHostRequestAdapter } from './ReceiveOrderByHostRequestAdapter';
import {
  ReceiveOrderHostResult,
  ReceiveOrderHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';
import {
  DraftedOrder,
  DraftedOrderPropsPlain,
} from '../../domain/entity/DraftedOrder';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { UserEditOrderRequestAdapter } from './EditOrderRequestAdapter';

// TODO: Separate out to classes per each use case
@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly receiveOrderByHostUseCase: ReceiveOrderHostUseCase,
    private readonly editOrderUseCase: EditOrderUseCase,
  ) {}

  // TODO(GLOBAL): Serialization
  @Post('create')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async draftOrder(
    @Body() orderRequest: DraftOrderRequestAdapter,
  ): Promise<DraftedOrderPropsPlain> {
    const draftedOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      orderRequest,
    );

    return draftedOrder.serialize();
  }

  @Post('confirm')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async confirmOrder(
    @Body() confirmationRequest: ConfirmOrderRequestAdapter,
  ): Promise<StripeCheckoutSession> {
    const checkoutId = await this.confirmOrderUseCase.execute(
      confirmationRequest,
    );

    return checkoutId;
  }

  @Post('receivedByHost')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async receiveOrderByHost(
    @Body() receiveOrderByHostRequest: ReceiveOrderHostRequestAdapter,
  ): Promise<ReceiveOrderHostResult> {
    const receivedByHostDate = await this.receiveOrderByHostUseCase.execute(
      receiveOrderByHostRequest,
    );

    return receivedByHostDate;
  }

  @Post('edit')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async editOrderByUser(
    @Body() userEditOrderProps: UserEditOrderRequestAdapter,
  ): Promise<DraftedOrderPropsPlain> {
    const editedDraftOrder: DraftedOrder = await this.editOrderUseCase.execute(
      userEditOrderProps,
    );

    return editedDraftOrder.serialize();
  }
}
