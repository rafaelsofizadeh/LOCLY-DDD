import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';

import { DraftOrderRequestAdapter } from './request-adapters/DraftOrderRequestAdapter';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { PreConfirmOrderRequestAdapter } from './request-adapters/PreConfirmOrderRequestAdapter';
import {
  StripeCheckoutSessionResult,
  PreConfirmOrderUseCase,
} from '../../domain/use-case/PreConfirmOrderUseCase';
import { ReceiveOrderByHostRequestAdapter } from './request-adapters/ReceiveOrderByHostRequestAdapter';
import {
  ReceiveOrderByHostResult,
  ReceiveOrderByHostUseCase,
} from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { SerializePrivatePropertiesInterceptor } from './nest-infrastructure/SerializePrivatePropertiesInterceptor';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { EditOrderRequestAdapter } from './request-adapters/EditOrderRequestAdapter';
import { DeleteOrderUseCase } from '../../domain/use-case/DeleteOrderUseCase';
import { DeleteOrderRequestAdapter } from './request-adapters/DeleteOrderRequestAdapter';

// TODO: Separate out to classes per each use case
@Controller('order')
export class OrderController {
  constructor(
    private readonly draftOrderUseCase: DraftOrderUseCase,
    private readonly editOrderUseCase: EditOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly preConfirmOrderUseCase: PreConfirmOrderUseCase,
    private readonly receiveOrderByHostUseCase: ReceiveOrderByHostUseCase,
  ) {}

  @Post('draft')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async draftOrder(
    @Body() orderRequest: DraftOrderRequestAdapter,
  ): Promise<DraftedOrder> {
    const draftedOrder: DraftedOrder = await this.draftOrderUseCase.execute(
      orderRequest,
    );

    return draftedOrder;
  }

  @Post('edit')
  @UseInterceptors(SerializePrivatePropertiesInterceptor)
  async editOrder(
    @Body() editOrderRequest: EditOrderRequestAdapter,
  ): Promise<DraftedOrder> {
    const editedDraftedOrder: DraftedOrder = await this.editOrderUseCase.execute(
      editOrderRequest,
    );

    return editedDraftedOrder;
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

  @Post('receivedByHost')
  async receiveOrderByHost(
    @Body() receiveOrderByHostRequest: ReceiveOrderByHostRequestAdapter,
  ): Promise<ReceiveOrderByHostResult> {
    const receivedByHostDateResult = await this.receiveOrderByHostUseCase.execute(
      receiveOrderByHostRequest,
    );

    return receivedByHostDateResult;
  }
}
