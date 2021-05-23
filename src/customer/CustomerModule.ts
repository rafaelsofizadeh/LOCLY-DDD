import { Module, Provider } from '@nestjs/common';
import { CreateCustomer } from './application/CreateCustomer/CreateCustomer';
import { ICreateCustomer } from './application/CreateCustomer/ICreateCustomer';
import { EditCustomer } from './application/EditCustomer/EditCustomer';
import { IEditCustomer } from './application/EditCustomer/IEditCustomer';
import { GetCustomer } from './application/GetCustomer/GetCustomer';
import { IGetCustomer } from './application/GetCustomer/IGetCustomer';
import { GetCustomerUpsert } from './application/GetCustomerUpsert/GetCustomerUpsert';
import { IGetCustomerUpsert } from './application/GetCustomerUpsert/IGetCustomerUpsert';
import { CustomerController } from './CustomerController';

const useCaseProviders: Provider[] = [
  { provide: ICreateCustomer, useClass: CreateCustomer },
  { provide: IGetCustomer, useClass: GetCustomer },
  { provide: IGetCustomerUpsert, useClass: GetCustomerUpsert },
  { provide: IEditCustomer, useClass: EditCustomer },
];

@Module({
  providers: [...useCaseProviders],
  exports: [...useCaseProviders],
  controllers: [CustomerController],
})
export class CustomerModule {}
