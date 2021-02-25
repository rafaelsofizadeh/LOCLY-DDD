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
import { Order } from '../../domain/entity/Order';
import { ConfirmOrderRequestAdapter } from './ConfirmOrderRequestAdapter';
import {
  ConfirmOrderResult,
  ConfirmOrderUseCase,
} from '../../domain/use-case/ConfirmOrderUseCase';

// TODO: Separate out to classes per each use case
@Controller('order')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
  ) {}

  @Post('create')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrder(
    @Body() orderRequest: CreateOrderRequestAdapter,
  ): Promise<Order> {
    const draftedOrder: Order = await this.createOrderUseCase.execute(
      orderRequest,
    );

    return draftedOrder;
  }

  @Post('confirm')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async confirmOrder(
    @Body() confirmationRequest: ConfirmOrderRequestAdapter,
  ): Promise<Order> {
    const confirmedOrder: Order = await this.confirmOrderUseCase.execute(
      confirmationRequest,
    );

    return confirmedOrder;
  }
}
