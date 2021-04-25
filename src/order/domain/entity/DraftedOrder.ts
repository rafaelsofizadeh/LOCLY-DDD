import { Modify } from '../../../common/domain';
import { UUID } from '../../../common/domain';
import { Code } from '../../../common/error-handling';
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

export interface DraftedOrderProps {
  id: UUID;
  customerId: UUID;
  items: Item[];
  originCountry: Country;
  destination: Address;
  shipmentCost: ShipmentCost;
}

export class DraftedOrder implements DraftedOrderProps {
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
  }: DraftedOrderProps) {
    this.id = id;
    this.customerId = customerId;
    this._items = items;
    this._destination = destination;
    this._shipmentCost = shipmentCost;
    this._originCountry = originCountry;
  }

  static fromData(payload: Modify<DraftedOrderProps, { items: ItemProps[] }>) {
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
    addOrder: (draftedOrder: DraftedOrder) => Promise<unknown>,
    addOrderToCustomer: (
      toBeAddedToCustomerId: UUID,
      toBeAddedToCustomerOrderId: UUID,
    ) => Promise<unknown>,
  ): Promise<DraftedOrder> {
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

    const draftedOrder: DraftedOrder = new this({
      id: UUID(),
      customerId,
      items,
      originCountry,
      destination,
      shipmentCost,
    });

    await Promise.all([
      addOrder(draftedOrder),
      addOrderToCustomer(draftedOrder.customerId, draftedOrder.id),
    ]);

    return draftedOrder;
  }

  async matchHost(
    findMatchingHostFn: (
      draftedOrderToMatchHostTo: DraftedOrder,
    ) => Promise<UUID>,
    persistHostMatch: (
      matchedOrder: DraftedOrder,
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
        Code.VALIDATION_ERROR,
        `Service unavailable for origin: ${originCountry} & destination: ${destinationCountry}.`,
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
      items.map(({ physicalCharacteristics }) => physicalCharacteristics),
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
    ) => Promise<DraftedOrder>,
  ): Promise<DraftedOrder> {
    // TODO(TRANSACTION#2): moving removeOldOrderFromCustomer below deleteOldOrder (thus making removeOldOrder and
    // draftNewOrder->addOrderToCustomer closer) leads to a writing conflict (TransientTransactionError)
    await Promise.all([
      removeOldOrderFromCustomer(customerId, orderId),
      deleteOldOrder(orderId, customerId),
    ]);

    const draftedOrder: DraftedOrder = await draftNewOrder({
      customerId,
      ...restDraftOrderRequest,
    });

    return draftedOrder;
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
    await Promise.all([
      deleteOrder(orderId, customerId),
      removeOrderFromCustomer(customerId, orderId),
    ]);
  }
}
