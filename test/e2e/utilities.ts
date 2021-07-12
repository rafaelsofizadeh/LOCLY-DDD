import { SuperAgentTest } from 'supertest';
import { IRequestAuth } from '../../src/auth/application/RequestAuth/IRequestAuth';
import { EntityType } from '../../src/auth/entity/Token';
import { Address, Email } from '../../src/common/domain';
import { ICreateCustomer } from '../../src/customer/application/CreateCustomer/ICreateCustomer';
import { IEditCustomer } from '../../src/customer/application/EditCustomer/IEditCustomer';
import { IGetCustomer } from '../../src/customer/application/GetCustomer/IGetCustomer';
import { Customer } from '../../src/customer/entity/Customer';
import { Country } from '../../src/order/entity/Country';

export async function createTestCustomer(
  customerCountry: Country,
  createCustomer: ICreateCustomer,
  editCustomer: IEditCustomer,
  getCustomer: IGetCustomer,
): Promise<Customer> {
  const address: Address = {
    addressLine1: '42 Random St.',
    locality: 'Random City',
    country: customerCountry,
  };

  const email = 'random@email.com';

  const { id: customerId } = await createCustomer.execute({
    port: { email },
  });

  await editCustomer.execute({
    port: {
      customerId,
      addresses: [address],
    },
  });

  const customer: Customer = await getCustomer.execute({
    port: { customerId, email },
  });

  return customer;
}

export async function authorize(
  email: Email,
  request: SuperAgentTest,
  requestAuthUseCase: IRequestAuth,
) {
  const authTokenString = await requestAuthUseCase.execute({
    port: { email, type: EntityType.Customer },
  });

  console.log('BLA BLA BLA', authTokenString);

  await request.get(`/auth/${authTokenString}`);
}
