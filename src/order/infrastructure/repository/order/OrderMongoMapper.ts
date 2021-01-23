import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { classToPlain } from 'class-transformer';

import { AddressProps } from '../../../domain/entity/Address';
import { ItemProps } from '../../../domain/entity/Item';
import {
  OrderProps,
  OrderStatus,
  ShipmentCost,
} from '../../../domain/entity/Order';

export type OrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  originCountry: string;
  items: ItemProps[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

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
