import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order } from '../../../domain/entity/Order';
import { OrderMongoDocument, orderToMongoDocument } from './OrderMongoMapper';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  async addOrder(order: Order) {
    const orderDocument = orderToMongoDocument(order);

    await this.orderCollection.insertOne(orderDocument).catch(error => {
      throw new Exception(
        Code.INTERNAL_ERROR,
        `Error creating a new order in the database. ${error.name}: ${error.message}`,
        { order, orderDocument },
      );
    });
  }
}
