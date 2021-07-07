import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

import { DraftOrderPayload, IDraftOrder } from './IDraftOrder';

import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import {
  getShipmentCostQuote,
  ShipmentCostQuote,
  ShipmentCostQuoteFn,
} from '../../../calculator/getShipmentCostQuote';
import { DraftedItem } from '../../entity/Item';
import { Address, UUID } from '../../../common/domain';
import { Country } from '../../entity/Country';
import { DraftedOrder, Cost, OrderStatus } from '../../entity/Order';
import { throwCustomException } from '../../../common/error-handling';

@Injectable()
export class DraftOrder implements IDraftOrder {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transaction
  async execute({
    port: draftOrderPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<DraftOrderPayload>): Promise<DraftedOrder> {
    return this.draftOrder(draftOrderPayload, mongoTransactionSession);
  }

  private async draftOrder(
    draftOrderPayload: DraftOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<DraftedOrder> {
    const draftOrder: DraftedOrder = this.constructDraftOrder(
      draftOrderPayload,
    );

    // TODO(IMPORANT): Document MongoDb concurrent transaction limitations.
    // https://jira.mongodb.org/browse/SERVER-36428?focusedCommentId=2136170&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-2136170
    // (GLOBAL) DON'T parallelize this. Promise.all()'ing these, together with transactions, will lead to random
    // TransientTransactionError errors.
    await this.orderRepository.addOrder(draftOrder, mongoTransactionSession);
    await this.customerRepository.addOrder(
      { customerId: draftOrder.customerId },
      draftOrder.id,
      mongoTransactionSession,
    );

    return draftOrder;
  }

  private constructDraftOrder({
    customerId,
    originCountry,
    items: itemsWithoutId,
    destination,
  }: DraftOrderPayload): DraftedOrder {
    // TODO: class-validator decorator https://github.com/typestack/class-validator/issues/486
    if (originCountry === destination.country) {
      throwCustomException(
        "Origin country can't be equal to destination country",
        { originCountry, destinationCountry: destination.country },
        HttpStatus.SERVICE_UNAVAILABLE,
      )();
    }

    const items: DraftedItem[] = itemsWithoutId.map(itemWithoutId => ({
      ...itemWithoutId,
      id: UUID(),
    }));

    const initialShipmentCost = this.approximateShipmentCost(
      originCountry,
      destination,
      items,
      getShipmentCostQuote,
    );

    return {
      id: UUID(),
      status: OrderStatus.Drafted,
      customerId,
      items,
      originCountry,
      destination,
      initialShipmentCost,
    };
  }

  // TODO: Currencies
  private approximateShipmentCost(
    originCountry: Country,
    { country: destinationCountry }: Address,
    items: DraftedItem[],
    getShipmentCostQuote: ShipmentCostQuoteFn,
  ): Cost {
    const { currency, services }: ShipmentCostQuote = getShipmentCostQuote(
      originCountry,
      destinationCountry,
      items.map(({ weight }) => ({ weight })),
    );

    // TODO: Service choice logic
    const { price: amount } = services[0];

    return { amount, currency };
  }
}
