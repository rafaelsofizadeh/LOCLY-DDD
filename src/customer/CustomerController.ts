import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { CustomerIdentity } from '../auth/infrastructure/IdentityDecorator';
import { UUID } from '../common/domain';
import { IDeleteCustomer } from './application/DeleteCustomer/IDeleteCustomer';
import {
  EditCustomerRequest,
  IEditCustomer,
} from './application/EditCustomer/IEditCustomer';
import { IGetCustomer } from './application/GetCustomer/IGetCustomer';
import { Customer, SerializedCustomer } from './entity/Customer';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly getCustomer: IGetCustomer,
    private readonly editCustomer: IEditCustomer,
    private readonly deleteCustomer: IDeleteCustomer,
  ) {}

  @Get()
  async getCustomerController(
    @CustomerIdentity() customerId: UUID,
  ): Promise<SerializedCustomer> {
    const {
      stripeCustomerId,
      ...customer
    }: Customer = await this.getCustomer.execute({
      port: { customerId },
    });

    return customer;
  }

  @Patch()
  async editCustomerController(
    @CustomerIdentity() customerId: UUID,
    @Body() editOrderRequest: EditCustomerRequest,
  ): Promise<void> {
    await this.editCustomer.execute({
      port: { customerId, ...editOrderRequest },
    });
  }

  @Delete()
  async deleteCustomerController(
    @CustomerIdentity() customerId: UUID,
  ): Promise<void> {
    await this.deleteCustomer.execute({ port: { customerId } });
  }
}
