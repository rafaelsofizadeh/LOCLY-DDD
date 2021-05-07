import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderRepository } from '../port/OrderRepository';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  FinalizeOrderRequest,
  FinalizeOrderUseCase,
} from '../../domain/use-case/FinalizeOrderUseCase';
import { AnyOrder, ConfirmedOrderStatus } from '../../domain/entity/Order';
import { throwCustomException } from '../../../common/error-handling';
import { Item } from '../../domain/entity/Item';
import { UUID } from '../../../common/domain';

@Injectable()
export class FinalizeOrderService implements FinalizeOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    finalizeOrderRequest: FinalizeOrderRequest,
    session?: ClientSession,
  ): Promise<void> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.finalizeOrder(finalizeOrderRequest, sessionWithTransaction),
      this.mongoClient,
      session,
    );
  }

  private async finalizeOrder(
    {
      orderId,
      hostId,
      totalWeight,
      deliveryCost,
      calculatorResultUrl,
    }: FinalizeOrderRequest,
    session: ClientSession,
  ): Promise<void> {
    const unfinishedItems: Item[] = await this.getUnfinalizedItems(
      orderId,
      hostId,
    );

    const unfinishedItemIds: UUID[] = unfinishedItems.map(({ id }) => id);

    if (unfinishedItems.length) {
      throwCustomException(
        "Can't finalize order until all items have weights and photos",
        { orderId, unfinishedItemIds },
        HttpStatus.FORBIDDEN,
      )();
    }

    await this.orderRepository.setProperties(
      // status and hostId are already checked in findOrder()
      { orderId },
      Object.assign(
        { totalWeight, deliveryCost },
        calculatorResultUrl ? { calculatorResultUrl } : {},
      ),
      session,
    );
  }

  private async getUnfinalizedItems(
    orderId: UUID,
    hostId: UUID,
  ): Promise<Item[]> {
    // TODO(?): Replace this check with a mongo query http://www.askasya.com/post/matchallarrayelements/
    const order: AnyOrder = (await this.orderRepository.findOrder({
      orderId,
      status: ConfirmedOrderStatus,
      hostId,
    })) as AnyOrder;

    const notFinalizedItems: Item[] = order.items.filter(
      ({ receivedDate, photos }) => !(receivedDate && photos.length),
    );

    return notFinalizedItems;
  }
}
