import { Module, Provider } from '@nestjs/common';
import { CreateCustomer } from './application/CreateCustomer/CreateCustomer';
import { ICreateCustomer } from './application/CreateCustomer/ICreateCustomer';
import { GetCustomer } from './application/GetCustomer/GetCustomer';
import { IGetCustomer } from './application/GetCustomer/IGetCustomer';
import { GetCustomerUpsert } from './application/GetCustomerUpsert/GetCustomerUpsert';
import { IGetCustomerUpsert } from './application/GetCustomerUpsert/IGetCustomerUpsert';

const useCaseProviders: Provider[] = [
  { provide: ICreateCustomer, useClass: CreateCustomer },
  { provide: IGetCustomer, useClass: GetCustomer },
  { provide: IGetCustomerUpsert, useClass: GetCustomerUpsert },
];

@Module({
  providers: [...useCaseProviders],
  exports: [...useCaseProviders],
})
export class CustomerModule {}
