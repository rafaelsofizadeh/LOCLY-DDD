import {
  Body,
  Controller,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateOrderRequestAdapter } from './CreateOrderRequestAdapter';
import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';
import { CreateOrderUseCaseProvider } from '../di/OrderDiTokens';
import { Order } from '../../domain/entity/Order';

@Controller('order')
export class OrderController {
  constructor(
    @Inject(CreateOrderUseCaseProvider)
    private readonly createOrderUseCase: CreateOrderUseCase,
  ) {}

  @Post('create')
  // Validation and transformation is performed by Nest.js global validation pipe
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async createOrder(@Body() orderRequest: CreateOrderRequestAdapter) {
    const createdOrder: Order = await this.createOrderUseCase.execute(
      orderRequest,
    );

    return createdOrder;
  }
}
