import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { classToPlain } from 'class-transformer';

import { EntityId } from '../../../../common/domain/EntityId';
import { AddressProps } from '../../../domain/entity/Address';
import { Item, ItemProps } from '../../../domain/entity/Item';
import {
  Order,
  OrderProps,
  OrderStatus,
  ShipmentCost,
} from '../../../domain/entity/Order';
import { muuidToEntityId } from '../../../../common/utils';
import { Customer } from '../../../domain/entity/Customer';

export type OrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  originCountry: string;
  items: ItemProps[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export type PopulatedOrderMongoDocument = Omit<
  OrderMongoDocument,
  'customerId'
> & { customer: Customer };

export function orderToMongoDocument(order: OrderProps): OrderMongoDocument {
  // For id, see: Entity { @Transform() id }
  const { id: rawId, ...restPlainOrder } = classToPlain(order) as Omit<
    OrderMongoDocument,
    '_id'
  > & {
    id: string;
  };
  const mongoBinaryId = MUUID.from(rawId);

  return {
    _id: mongoBinaryId,
    ...restPlainOrder,
  };
}

export function mongoDocumentToOrder({
  _id,
  items,
  originCountry,
  customer,
}: PopulatedOrderMongoDocument): Order {
  return new Order({
    id: muuidToEntityId(_id),
    customer,
    items: items.map(item => new Item(item)),
    originCountry,
  });
}
