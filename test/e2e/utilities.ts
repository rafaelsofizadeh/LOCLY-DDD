import { TestingModule } from '@nestjs/testing';
import { join } from 'path';
import Stripe from 'stripe';
import supertest, { SuperAgentTest, agent, Response } from 'supertest';
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
import { IConfirmOrder } from '../../src/order/application/ConfirmOrder/IConfirmOrder';
import { IDraftOrder } from '../../src/order/application/DraftOrder/IDraftOrder';
import { IReceiveItem } from '../../src/order/application/ReceiveItem/IReceiveItem';
import { IConfirmOrderHandler } from '../../src/order/application/StripeCheckoutWebhook/handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import { Country } from '../../src/order/entity/Country';
import { ConfirmedOrder, FinalizedOrder } from '../../src/order/entity/Order';
import { IOrderRepository } from '../../src/order/persistence/IOrderRepository';

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
  country: Country = originCountriesAvailable[0],
  verified: boolean = true,
  available: boolean = true,
  profileComplete: boolean = true,
  orderCount: number = 0,
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

  if (verified) {
    createHost.createHostStripeAccount = async function createHostStripeAccount() {
      const hostStripeAccount: Stripe.Account = await this.stripe.accounts.create(
        {
          type: 'custom',
          email,
          country: 'US',
          capabilities: {
            transfers: { requested: true },
          },
          business_type: 'individual',
          business_profile: {
            url: 'https://bestcookieco.com',
          },
          individual: {
            address: {
              // https://stripe.com/docs/connect/testing#test-verification-addresses
              line1: 'address_full_match​',
              city: 'Cambridge​',
              state: 'MA',
              postal_code: '02140',
            },
            dob: {
              day: 1,
              month: 1,
              year: 1901,
            },
            first_name: 'Rafael',
            last_name: 'Sofizada',
            // https://stripe.com/docs/connect/testing#test-personal-id-numbers
            id_number: '000000000',
            ssn_last_4: '0000',
          },
          external_account: {
            object: 'bank_account',
            country: 'US',
            currency: 'usd',
            // https://stripe.com/docs/connect/testing#account-numbers
            routing_number: '110000000',
            account_number: '000123456789',
          },
          // Possible to do through Stripe dashboard
          // https://stripe.com/docs/connect/service-agreement-types#choosing-type-with-express
          // https://dashboard.stripe.com/settings/connect/express
          tos_acceptance: {
            date: Math.round(new Date().getTime() / 1000),
            ip: '172.18.80.19',
          },
        },
      );

      if (hostStripeAccount.capabilities.transfers !== 'active') {
        throw new Error(
          'Error creating test host Stripe account: transfers capability not active',
        );
      }

      return hostStripeAccount;
    };
  }

  const { id: hostId } = await createHost.execute({
    port: { email, country },
  });

  await hostRepository.setProperties(
    { hostId },
    {
      available,
      verified,
      profileComplete,
      firstName: 'Host',
      lastName: 'Testov',
      orderIds: Array(orderCount)
        .fill('')
        .map(() => UUID()),
      address: {
        addressLine1: '42 Random St.',
        locality: 'Random City',
        country,
      },
    },
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

export async function createConfirmedOrder(
  moduleRef: TestingModule,
  orderRepository: IOrderRepository,
  {
    customer,
    originCountry,
    host,
    itemCount = 1,
  }: {
    customer: Customer;
    originCountry: Country;
    host: Host;
    itemCount?: number;
  },
): Promise<ConfirmedOrder> {
  const draftOrder: IDraftOrder = await moduleRef.resolve(IDraftOrder);
  const confirmOrder: IConfirmOrder = await moduleRef.resolve(IConfirmOrder);
  const confirmOrderWebhookHandler: IConfirmOrderHandler = await moduleRef.resolve(
    IConfirmOrderHandler,
  );

  const itemRequest = Array(itemCount)
    .fill({})
    .map((_, index) => ({
      title: 'Item #' + (index + 1),
      storeName: 'Random Store',
      weight: 2000 / itemCount,
    }));

  const { id: orderId } = await draftOrder.execute({
    port: {
      customerId: customer.id,
      originCountry,
      destination: customer.addresses[0],
      items: itemRequest,
    },
  });

  await confirmOrder.execute({
    port: { orderId, customerId: customer.id },
  });

  await confirmOrderWebhookHandler.execute({
    port: { orderId, hostId: host.id },
  });

  return (await orderRepository.findOrder({ orderId })) as ConfirmedOrder;
}

export async function createFinalizedOrder(
  moduleRef: TestingModule,
  agent: supertest.SuperAgentTest,
  orderRepository: IOrderRepository,
  {
    customer,
    originCountry,
    host,
  }: {
    customer: Customer;
    originCountry: Country;
    host: Host;
  },
): Promise<FinalizedOrder> {
  const draftOrder: IDraftOrder = await moduleRef.resolve(IDraftOrder);
  const confirmOrder: IConfirmOrder = await moduleRef.resolve(IConfirmOrder);
  const confirmOrderWebhookHandler: IConfirmOrderHandler = await moduleRef.resolve(
    IConfirmOrderHandler,
  );
  const receiveItem: IReceiveItem = await moduleRef.resolve(IReceiveItem);

  const {
    id: orderId,
    items: [{ id: itemId }],
  } = await draftOrder.execute({
    port: {
      customerId: customer.id,
      originCountry,
      destination: customer.addresses[0],
      items: [
        {
          title: 'Item #1',
          storeName: 'Random Store',
          weight: 2000,
        },
      ],
    },
  });

  await confirmOrder.execute({
    port: { orderId, customerId: customer.id },
  });

  await confirmOrderWebhookHandler.execute({
    port: { orderId, hostId: host.id },
  });

  await receiveItem.execute({
    port: {
      orderId,
      itemId,
      hostId: host.id,
    },
  });

  await agent
    .post('/order/itemPhotos')
    .field('payload', JSON.stringify({ orderId, itemId }))
    .attach('photos', join(__dirname, './order/addItemPhotos-test-image.png'));

  await agent
    .post('/order/shipmentInfo')
    .field(
      'payload',
      // TODO: Pass as parameter
      JSON.stringify({
        orderId,
        totalWeight: 2000,
        shipmentCost: {
          amount: 100,
          currency: 'USD',
        },
        calculatorResultUrl: 'news.ycombinator.com',
      }),
    )
    .attach(
      'proofOfPayment',
      join(__dirname, './order/submitShipmentInfo-test-image.png'),
    );

  return (await orderRepository.findOrder({ orderId })) as FinalizedOrder;
}
