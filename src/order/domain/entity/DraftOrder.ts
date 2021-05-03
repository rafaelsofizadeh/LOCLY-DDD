import { HttpStatus } from '@nestjs/common';
import { Modify } from '../../../common/domain';
import { UUID } from '../../../common/domain';
import { Exception } from '../../../common/error-handling';
import { ServiceAvailabilityFn } from '../../application/services/checkServiceAvailability';
import {
  ShipmentCostQuote,
  ShipmentCostQuoteFn,
} from '../../application/services/ShipmentCostCalculator/getShipmentCostQuote';
import { Country } from '../data/Country';
import { Currency } from '../data/Currency';
import { DeleteOrderRequest } from '../use-case/DeleteOrderUseCase';
import { DraftOrderRequest } from '../use-case/DraftOrderUseCase';
import { EditOrderRequest } from '../use-case/EditOrderUseCase';
import { Address } from './Address';
import { Item, ItemProps } from './Item';
import { ShipmentCost } from './Order';

export type ServiceFee = {
  currency: Currency;
  amount: number;
};

export interface DraftOrderProps {
  id: UUID;
  customerId: UUID;
  items: Item[];
  originCountry: Country;
  destination: Address;
  shipmentCost: ShipmentCost;
}

export class DraftOrder implements DraftOrderProps {
  readonly id: UUID;

  readonly customerId: UUID;

  private _items: Item[];

  private _originCountry: Country;

  private _destination: Address;

  private _shipmentCost: ShipmentCost;

  get items(): Item[] {
    return this._items;
  }

  get originCountry(): Country {
    return this._originCountry;
  }

  get destination(): Address {
    return this._destination;
  }

  get shipmentCost(): ShipmentCost {
    return this._shipmentCost;
  }

  private constructor({
    id,
    customerId,
    items,
    originCountry,
    destination,
    shipmentCost,
  }: DraftOrderProps) {
    this.id = id;
    this.customerId = customerId;
    this._items = items;
    this._destination = destination;
    this._shipmentCost = shipmentCost;
    this._originCountry = originCountry;
  }

  static fromData(payload: Modify<DraftOrderProps, { items: ItemProps[] }>) {
    return new this({
      ...payload,
      items: payload.items.map(Item.fromData.bind(Item)),
    });
  }

  static async create(
    {
      customerId,
      items: itemProps,
      originCountry,
      destination,
    }: DraftOrderRequest,
    shipmentCostQuoteFn: ShipmentCostQuoteFn,
    serviceAvailabilityFn: ServiceAvailabilityFn,
    addOrder: (draftOrder: DraftOrder) => Promise<unknown>,
    addOrderToCustomer: (
      toBeAddedToCustomerId: UUID,
      toBeAddedToCustomerOrderId: UUID,
    ) => Promise<unknown>,
  ): Promise<DraftOrder> {
    this.validateOriginDestination(
      originCountry,
      destination,
      serviceAvailabilityFn,
    );

    const items = itemProps.map((subitemProps: ItemProps) =>
      Item.create(subitemProps),
    );

    const shipmentCost = this.approximateShipmentCost(
      originCountry,
      destination,
      items,
      shipmentCostQuoteFn,
    );

    const draftOrder: DraftOrder = new this({
      id: UUID(),
      customerId,
      items,
      originCountry,
      destination,
      shipmentCost,
    });

    // TODO(IMPORANT): Document MongoDb concurrent transaction limitations.
    // https://jira.mongodb.org/browse/SERVER-36428?focusedCommentId=2136170&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-2136170
    // (GLOBAL) DON'T parallelize this. Promise.all()'ing these, together with transactions, will lead to random
    // TransientTransactionError errors.
    await addOrder(draftOrder);
    await addOrderToCustomer(draftOrder.customerId, draftOrder.id);

    return draftOrder;
  }

  async matchHost(
    findMatchingHostFn: (draftOrderToMatchHostTo: DraftOrder) => Promise<UUID>,
    persistHostMatch: (
      matchedOrder: DraftOrder,
      matchedHostId: UUID,
    ) => Promise<UUID>,
  ): Promise<UUID> {
    const matchedHostId: UUID = await findMatchingHostFn(this);
    const matchId: UUID = await persistHostMatch(this, matchedHostId);

    return matchId;
  }

  private static validateOriginDestination(
    originCountry: Country,
    { country: destinationCountry }: Address,
    checkServiceAvailability: ServiceAvailabilityFn,
  ) {
    const isServiceAvailable: boolean = checkServiceAvailability(
      originCountry,
      destinationCountry,
    );

    if (!isServiceAvailable) {
      throw new Exception(
        HttpStatus.SERVICE_UNAVAILABLE,
        `Service unavailable for origin = ${originCountry}, destination = ${destinationCountry}`,
        { originCountry, destinationCountry },
      );
    }
  }

  private static approximateShipmentCost(
    originCountry: Country,
    { country: destinationCountry }: Address,
    items: Item[],
    getShipmentCostQuote: ShipmentCostQuoteFn,
  ): ShipmentCost {
    const { currency, services }: ShipmentCostQuote = getShipmentCostQuote(
      originCountry,
      destinationCountry,
      items.map(item => ({ weight: item.weight })),
    );

    // TODO: Service choice logic
    const { price: amount } = services[0];

    return { amount, currency };
  }

  async calculateServiceFee(): Promise<ServiceFee> {
    return {
      currency: 'USD',
      amount: 100,
    };
  }

  static async edit(
    { orderId, customerId, ...restDraftOrderRequest }: EditOrderRequest,
    deleteOldOrder: (
      toBeDeletedOrderId: UUID,
      orderOwnerCustomerId: UUID,
    ) => Promise<unknown>,
    removeOldOrderFromCustomer: (
      toBeRemovedFromCustomerId: UUID,
      toBeRemovedFromCustomerOrderId: UUID,
    ) => Promise<unknown>,
    draftNewOrder: (
      draftOrderRequest: DraftOrderRequest,
    ) => Promise<DraftOrder>,
  ): Promise<DraftOrder> {
    await removeOldOrderFromCustomer(customerId, orderId);
    await deleteOldOrder(orderId, customerId);

    const draftOrder: DraftOrder = await draftNewOrder({
      customerId,
      ...restDraftOrderRequest,
    });

    return draftOrder;
  }

  static async delete(
    { orderId, customerId }: DeleteOrderRequest,
    deleteOrder: (
      toBeDeletedOrderId: UUID,
      orderOwnerCustomerId: UUID,
    ) => Promise<unknown>,
    removeOrderFromCustomer: (
      toRemoveOrderFromCustomerId: UUID,
      toBeRemovedFromCustomerOrderId: UUID,
    ) => Promise<unknown>,
  ) {
    await deleteOrder(orderId, customerId);
    await removeOrderFromCustomer(customerId, orderId);
  }
}
