import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CustomerIdentity } from '../auth/infrastructure/IdentityDecorator';
import { UUID } from '../common/domain';
import {
  EditCustomerRequest,
  IEditCustomer,
} from './application/EditCustomer/IEditCustomer';
import { IGetCustomer } from './application/GetCustomer/IGetCustomer';
import { Customer } from './entity/Customer';

@Controller('user')
export class CustomerController {
  constructor(
    private readonly getCustomer: IGetCustomer,
    private readonly editCustomer: IEditCustomer,
  ) {}

  // TODO: Add serialization
  @Get()
  async getCustomerController(
    @CustomerIdentity() customerId: UUID,
  ): Promise<Customer> {
    const customer: Customer = await this.getCustomer.execute({ customerId });

    return customer;
  }

  @Patch()
  async editCustomerController(
    @CustomerIdentity() customerId: UUID,
    @Body() editOrderRequest: EditCustomerRequest,
  ): Promise<void> {
    await this.editCustomer.execute({ customerId, ...editOrderRequest });
  }
}
