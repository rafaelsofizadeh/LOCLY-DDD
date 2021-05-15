import { forwardRef, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from 'nest-mongodb';
import { OrderModule } from '../order/OrderModule';
import { CreateCustomer } from './application/CreateCustomer/CreateCustomer';
import { ICreateCustomer } from './application/CreateCustomer/ICreateCustomer';
import { GetCustomer } from './application/GetCustomer/GetCustomer';
import { IGetCustomer } from './application/GetCustomer/IGetCustomer';
import { GetCustomerUpsert } from './application/GetCustomerUpsert/GetCustomerUpsert';
import { IGetCustomerUpsert } from './application/GetCustomerUpsert/IGetCustomerUpsert';
import { CustomerMongoRepositoryAdapter } from './persistence/CustomerMongoRepositoryAdapter';
import { ICustomerRepository } from './persistence/ICustomerRepository';

const useCaseProviders: Provider[] = [
  { provide: ICreateCustomer, useClass: CreateCustomer },
  { provide: IGetCustomer, useClass: GetCustomer },
  { provide: IGetCustomerUpsert, useClass: GetCustomerUpsert },
];

const persistenceProviders: Provider[] = [
  {
    provide: ICustomerRepository,
    useClass: CustomerMongoRepositoryAdapter,
  },
];

const providers: Provider[] = [...useCaseProviders, ...persistenceProviders];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoModule.forFeature(['customers']),
    forwardRef(() => OrderModule),
  ],
  providers,
  exports: [...persistenceProviders, ...useCaseProviders],
})
export class CustomerModule {}
