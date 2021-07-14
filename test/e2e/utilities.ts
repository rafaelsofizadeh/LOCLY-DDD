import { TestingModule } from '@nestjs/testing';
import { SuperAgentTest, agent, Response } from 'supertest';
import { IRequestAuth } from '../../src/auth/application/RequestAuth/IRequestAuth';
import { UserType } from '../../src/auth/entity/Token';
import {
  getDestinationCountriesAvailable,
  originCountriesAvailable,
} from '../../src/calculator/data/PriceGuide';
import { Address, Email, UUID } from '../../src/common/domain';
import { ICreateCustomer } from '../../src/customer/application/CreateCustomer/ICreateCustomer';
import { IDeleteCustomer } from '../../src/customer/application/DeleteCustomer/IDeleteCustomer';
import { IEditCustomer } from '../../src/customer/application/EditCustomer/IEditCustomer';
import { IGetCustomer } from '../../src/customer/application/GetCustomer/IGetCustomer';
import { Customer } from '../../src/customer/entity/Customer';
import { ICreateHost } from '../../src/host/application/CreateHost/ICreateHost';
import { IDeleteHost } from '../../src/host/application/DeleteHost/IDeleteHost';
import { IEditHost } from '../../src/host/application/EditHost/IEditHost';
import { IGetHost } from '../../src/host/application/GetHost/IGetHost';
import { Host } from '../../src/host/entity/Host';
import { IHostRepository } from '../../src/host/persistence/IHostRepository';
import { Country } from '../../src/order/entity/Country';

export async function createTestCustomer(
  moduleRef: TestingModule,
  orderOriginCountry: Country = originCountriesAvailable[0],
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

  const email = `${UUID()}@email.com`;
  const country: Country = getDestinationCountriesAvailable(
    orderOriginCountry,
  )[0];
  const address: Address = {
    addressLine1: '42 Random St.',
    locality: 'Random City',
    country: country,
  };

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

export async function createTestHost(
  moduleRef: TestingModule,
  orderOriginCountry: Country = originCountriesAvailable[0],
): Promise<{
  host: Host;
  createHost: ICreateHost;
  editHost: IEditHost;
  getHost: IGetHost;
  deleteHost: IDeleteHost;
}> {
  const createHost: ICreateHost = await moduleRef.resolve(ICreateHost);
  const editHost: IEditHost = await moduleRef.resolve(IEditHost);
  const getHost: IGetHost = await moduleRef.resolve(IGetHost);
  const deleteHost: IDeleteHost = await moduleRef.resolve(IDeleteHost);

  const hostRepository: IHostRepository = await moduleRef.resolve(
    IHostRepository,
  );

  const email = `${UUID()}@email.com`;
  const country: Country = orderOriginCountry;

  const { id: hostId } = await createHost.execute({
    port: { email, country },
  });

  const firstName = 'Host';
  const lastName = 'Testov';
  const address: Address = {
    addressLine1: '42 Random St.',
    locality: 'Random City',
    country,
  };

  await editHost.execute({
    port: {
      currentHostProperties: { id: hostId },
      firstName,
      lastName,
      address,
    },
  });

  await hostRepository.setProperties(
    { hostId },
    { available: true, verified: true },
  );

  const host: Host = await getHost.execute({
    port: { hostId, email },
  });

  return {
    host,
    createHost,
    editHost,
    getHost,
    deleteHost,
  };
}

export async function authorize(
  app: any,
  moduleRef: TestingModule,
): Promise<{
  agent: SuperAgentTest;
}>;
export async function authorize(
  app: any,
  moduleRef: TestingModule,
  email: Email,
  userType: UserType,
): Promise<{
  agent: SuperAgentTest;
  logout: () => Promise<Response>;
}>;
export async function authorize(
  app: any,
  moduleRef: TestingModule,
  email?: Email,
  userType?: UserType,
): Promise<{
  agent: SuperAgentTest;
  logout?: () => Promise<Response>;
}> {
  const requestAgent = agent(app.getHttpServer());

  const requestAuth: IRequestAuth = await moduleRef.resolve(IRequestAuth);

  if (email && userType) {
    const authTokenString = await requestAuth.execute({
      port: { email, type: userType },
    });

    await requestAgent.get(`/auth/${authTokenString}`);
  }

  return {
    agent: requestAgent,
    logout: () => requestAgent.post('/auth/logout').send(),
  };
}
