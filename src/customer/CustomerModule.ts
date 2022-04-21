import { Module, Provider } from '@nestjs/common';
import { AddReferralCode } from './application/AddReferralCode/AddReferralCode';
import { IAddReferralCode } from './application/AddReferralCode/IAddReferralCode';
import { CreateCustomer } from './application/CreateCustomer/CreateCustomer';
import { ICreateCustomer } from './application/CreateCustomer/ICreateCustomer';
import { DeleteCustomer } from './application/DeleteCustomer/DeleteCustomer';
import { IDeleteCustomer } from './application/DeleteCustomer/IDeleteCustomer';
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
  { provide: IAddReferralCode, useClass: AddReferralCode },
  { provide: IDeleteCustomer, useClass: DeleteCustomer },
];

@Module({
  providers: [...useCaseProviders],
  exports: [...useCaseProviders],
  controllers: [CustomerController],
})
export class CustomerModule {}
