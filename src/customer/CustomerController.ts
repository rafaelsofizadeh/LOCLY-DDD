import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { CustomerIdentity } from '../auth/infrastructure/IdentityDecorator';
import { UUID } from '../common/domain';
import {
  AddReferralCodeRequest,
  IAddReferralCode,
} from './application/AddReferralCode/IAddReferralCode';
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
    private readonly addReferralCode: IAddReferralCode,
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

  @Post('referral')
  async addReferralCodeController(
    @CustomerIdentity() customerId: UUID,
    @Body() addReferralCodeRequest: AddReferralCodeRequest,
  ) {
    await this.addReferralCode.execute({
      port: { customerId, ...addReferralCodeRequest },
    });
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
