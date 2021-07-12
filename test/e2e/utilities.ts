import { TestingModule } from '@nestjs/testing';
import { SuperAgentTest, agent } from 'supertest';
import { IRequestAuth } from '../../src/auth/application/RequestAuth/IRequestAuth';
import { EntityType } from '../../src/auth/entity/Token';
import { Address, Email } from '../../src/common/domain';
import { ICreateCustomer } from '../../src/customer/application/CreateCustomer/ICreateCustomer';
import { IDeleteCustomer } from '../../src/customer/application/DeleteCustomer/IDeleteCustomer';
import { IEditCustomer } from '../../src/customer/application/EditCustomer/IEditCustomer';
import { IGetCustomer } from '../../src/customer/application/GetCustomer/IGetCustomer';
import { Customer } from '../../src/customer/entity/Customer';
import { Country } from '../../src/order/entity/Country';

export async function createTestCustomer(
  customerCountry: Country,
  moduleRef: TestingModule,
): Promise<{
  customer: Customer;
  createCustomer: ICreateCustomer;
  editCustomer: IEditCustomer;
  getCustomer: IGetCustomer;
  deleteCustomer: IDeleteCustomer;
}> {
  const createCustomer: ICreateCustomer = await moduleRef.resolve(
    ICreateCustomer,
  );
  const editCustomer: IEditCustomer = await moduleRef.resolve(IEditCustomer);
  const getCustomer: IGetCustomer = await moduleRef.resolve(IGetCustomer);
  const deleteCustomer: IDeleteCustomer = await moduleRef.resolve(
    IDeleteCustomer,
  );

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

  return {
    customer,
    createCustomer,
    editCustomer,
    getCustomer,
    deleteCustomer,
  };
}

export async function authorize(
  app: any,
  moduleRef: TestingModule,
  email: Email,
): Promise<SuperAgentTest> {
  const requestAgent = agent(app.getHttpServer());

  const requestAuth: IRequestAuth = await moduleRef.resolve(IRequestAuth);
  const authTokenString = await requestAuth.execute({
    port: { email, type: EntityType.Customer },
  });

  await requestAgent.get(`/auth/${authTokenString}`);

  return requestAgent;
}
