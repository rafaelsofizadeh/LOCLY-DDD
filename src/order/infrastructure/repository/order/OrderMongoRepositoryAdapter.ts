import { Injectable } from '@nestjs/common';
import * as MUUID from 'uuid-mongodb';
import { Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order } from '../../../domain/entity/Order';
import { CustomerRepository } from '../../../application/port/CustomerRepository';
import { Customer } from '../../../domain/entity/Customer';
import { muuidToEntityId } from '../../../../common/utils';
import {
  mongoDocumentToOrder,
  OrderMongoDocument,
  orderToMongoDocument,
} from './OrderMongoMapper';

// TODO: mongoDocumentToXXX to a decorator
@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async addOrder(order: Order): Promise<void> {
    const orderDocument = orderToMongoDocument(order);

    await this.orderCollection.insertOne(orderDocument).catch(error => {
      throw new Exception(
        Code.INTERNAL_ERROR,
        `Error creating a new order in the database. ${error.name}: ${error.message}`,
        { order, orderDocument },
      );
    });
  }

  async findOrder(orderId: EntityId): Promise<Order> {
    const orderDocument: OrderMongoDocument = await this.orderCollection.findOne(
      { _id: MUUID.from(orderId.value) },
    );

    const customer: Customer = await this.customerRepository.findCustomer(
      muuidToEntityId(orderDocument.customerId),
    );

    if (!orderDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Order (id: ${orderId.value}) not found`,
        { orderId },
      );
    }

    return mongoDocumentToOrder({ ...orderDocument, customer });

  async deleteOrder(orderId: EntityId): Promise<void> {
    this.orderCollection.deleteOne({ _id: MUUID.from(orderId.value) });
  }
}
