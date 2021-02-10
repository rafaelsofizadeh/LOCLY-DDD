import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Inject,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateOrderRequestAdapter } from './CreateOrderRequestAdapter';
import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';
import { Order } from '../../domain/entity/Order';

@Controller('order')
export class OrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post('create')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrder(@Body() orderRequest: CreateOrderRequestAdapter) {
    const draftedOrder: Order = await this.createOrderUseCase.execute(
      orderRequest,
    );

    return draftedOrder;
  }
}
