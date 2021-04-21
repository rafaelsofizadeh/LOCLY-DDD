import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';

import { DraftOrderRequestAdapter } from './DraftOrderRequestAdapter';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { ConfirmOrderRequestAdapter } from './ConfirmOrderRequestAdapter';
import {
  StripeCheckoutSessionResult,
  ConfirmOrderUseCase,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { ReceiveOrderHostRequestAdapter } from './ReceiveOrderByHostRequestAdapter';
import {
  ReceiveOrderHostResult,
  ReceiveOrderHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { SerializePrivatePropertiesInterceptor } from './SerializePrivatePropertiesInterceptor';

// TODO: Separate out to classes per each use case
@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly receiveOrderByHostUseCase: ReceiveOrderHostUseCase,
  ) {}

  @Post('create')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async draftOrder(
    @Body() orderRequest: DraftOrderRequestAdapter,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      orderRequest,
    );

    return draftedOrder;
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

  @Post('receivedByHost')
  async receiveOrderByHost(
    @Body() receiveOrderByHostRequest: ReceiveOrderHostRequestAdapter,
  ): Promise<ReceiveOrderHostResult> {
    const receivedByHostDateResult = await this.receiveOrderByHostUseCase.execute(
      receiveOrderByHostRequest,
    );

    return receivedByHostDateResult;
  }
}
