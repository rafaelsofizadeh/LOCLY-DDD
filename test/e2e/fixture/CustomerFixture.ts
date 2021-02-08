import { v4 as uuidv4 } from 'uuid';
import { Collection, DeleteWriteOpResultObject } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { InjectCollection } from 'nest-mongodb';

import { Customer } from '../../../src/order/domain/entity/Customer';
/* For TODO:
import { CustomerRepositoryProvider } from '../../../src/order/infrastructure/di/OrderDiTokens';
import { CustomerRepository } from '../../../src/order/application/port/CustomerRepository';
import { CustomerMongoRepositoryAdapter } from '../../../src/order/infrastructure/repository/customer/CustomerMongoRepositoryAdapter';
*/
import { CustomerMongoDocument } from '../../../src/order/infrastructure/repository/customer/CustomerMongoMapper';
import { EntityId } from '../../../src/common/domain/EntityId';
import { Address } from '../../../src/order/domain/entity/Address';

export class CustomerFixture {
  protected testCustomer: Customer;

  constructor(
    /* For TODO, add this
    private readonly testingModule: TestingModule,
    and remove customerCollection
     */
    @InjectCollection('customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async insertTestCustomer(): Promise<Customer> {
    const customer: Customer = new Customer({
      id: new EntityId(uuidv4()),
      selectedAddress: new Address({ country: 'AUS' }),
    });

    /**
     * TODO: Insert customer through CustomerRepositoryProvider.
     * For that, add .addCustomer() method to CustomerRepository and its implementations.
     */
    await this.customerCollection.insertOne({
      _id: MUUID.from(customer.id.value),
      addresses: [{ ...customer.selectedAddress, selected: true }],
    });

    this.testCustomer = customer;
    return this.testCustomer;
  }

  // TODO: generalize to cleanup() once more use cases are available
  async deleteTestCustomer(): Promise<DeleteWriteOpResultObject> {
    return await this.customerCollection.deleteOne({
      _id: MUUID.from(this.testCustomer.id.value),
    });
  }
}
