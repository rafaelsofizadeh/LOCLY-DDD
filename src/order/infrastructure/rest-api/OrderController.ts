import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateOrderRequestAdapter } from './CreateOrderRequestAdapter';
import { CreateOrderUseCase } from '../../domain/use-case/CreateOrderUseCase';
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

// TODO: Separate out to classes per each use case
@Controller('order')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly receiveOrderByHostUseCase: ReceiveOrderHostUseCase,
  ) {}

  @Post('create')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOrder(
    @Body() orderRequest: CreateOrderRequestAdapter,
  ): Promise<DraftedOrderPropsPlain> {
    const draftedOrder: DraftedOrder = await this.createOrderUseCase.execute(
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
}
