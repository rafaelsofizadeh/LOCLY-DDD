import child_process from 'child_process';
import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Host } from '../../../src/host/entity/Host';

import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Country } from '../../../src/order/entity/Country';
import {
  OrderStatus,
  FinalizedOrder,
  PaidOrder,
} from '../../../src/order/entity/Order';
import { setupNestApp } from '../../../src/main';
import {
  authorize,
  createFinalizedOrder,
  createTestCustomer,
  createTestHost,
  initStripe,
} from '../utilities';
import { IDeleteCustomer } from '../../../src/customer/application/DeleteCustomer/IDeleteCustomer';
import { IDeleteOrder } from '../../../src/order/application/DeleteOrder/IDeleteOrder';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { UserType } from '../../../src/auth/entity/Token';
import Stripe from 'stripe';
import { STRIPE_CLIENT_TOKEN } from '@golevelup/nestjs-stripe';
import { stripePrice } from '../../../src/common/application';
import { IDeleteHost } from '../../../src/host/application/DeleteHost/IDeleteHost';
import {
  PayShipmentRequest,
  PayShipmentResult,
} from '../../../src/order/application/PayShipment/IPayShipment';
import { fillStripeCheckoutForm } from './ConfirmOrder.e2e-spec';

jest.setTimeout(50000);

describe('Pay Shipment – POST /order/payShipment', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof supertest.agent>;
  let stripe: Stripe;
  let configService: ConfigService;

  let order: FinalizedOrder;
  let deleteOrder: IDeleteOrder;
  let orderRepository: IOrderRepository;

  let customer: Customer;
  let deleteCustomer: IDeleteCustomer;

  let host: Host;
  let deleteHost: IDeleteHost;

  let stripeListener: child_process.ChildProcess;

  const originCountry: Country = originCountriesAvailable[0];

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(undefined, {
      bodyParser: false,
    });
    setupNestApp(app);
    await app.init();

    stripe = await moduleRef.resolve(STRIPE_CLIENT_TOKEN);
    configService = await moduleRef.resolve(ConfigService);

    orderRepository = await moduleRef.resolve(IOrderRepository);
    deleteOrder = await moduleRef.resolve(IDeleteOrder);

    ({ host, deleteHost } = await createTestHost(moduleRef, originCountry));
    ({ customer, deleteCustomer } = await createTestCustomer(moduleRef));

    ({ agent } = await authorize(app, moduleRef, host.email, UserType.Host));

    stripeListener = await initStripe(configService);
  });

  beforeEach(async () => {
    order = await createFinalizedOrder(moduleRef, agent, orderRepository, {
      customer,
      host,
      originCountry,
    });
  });

  afterEach(async () => {
    await Promise.allSettled([
      deleteOrder.execute({
        port: { customerId: customer.id, orderId: order.id },
      }),
    ]);
  });

  afterAll(async () => {
    await Promise.allSettled([
      deleteHost.execute({ port: { hostId: host.id } }),
      deleteCustomer.execute({ port: { customerId: customer.id } }),
    ]);

    stripeListener.kill();
    await app.close();
  });

  it(`Finalizes the order and completes Stripe checkout for shipment fee`, async () => {
    const loclyStripeBalanceBefore: Stripe.Balance = await stripe.balance.retrieve();
    // The shipment fee should go only to the host
    const hostStripeBalanceBefore: Stripe.Balance = await stripe.balance.retrieve(
      { stripeAccount: host.stripeAccountId },
    );

    const request: PayShipmentRequest = {
      orderId: order.id,
    };

    ({ agent } = await authorize(
      app,
      moduleRef,
      customer.email,
      UserType.Customer,
    ));

    const response: supertest.Response = await agent
      .post('/order/payShipment')
      .send(request);

    expect(response.status).toBe(HttpStatus.CREATED);

    const { checkoutUrl } = response.body as PayShipmentResult;
    expect(checkoutUrl).toMatch(/https:\/\/checkout\.stripe\.com\/pay\/cs/);

    await fillStripeCheckoutForm(checkoutUrl);
    await new Promise(res => setTimeout(res, 15000));

    const updatedOrder = (await orderRepository.findOrder({
      orderId: order.id,
    })) as PaidOrder;

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.status).toBe(OrderStatus.Paid);

    const loclyStripeBalanceAfter: Stripe.Balance = await stripe.balance.retrieve();
    const hostStripeBalanceAfter: Stripe.Balance = await stripe.balance.retrieve(
      { stripeAccount: host.stripeAccountId },
    );

    const shipmentFee = updatedOrder.finalShipmentCost;
    const shipmentPrice = stripePrice(shipmentFee);

    const findBalance = ({ pending }: Stripe.Balance) =>
      pending.find(({ currency }) => currency === shipmentPrice.currency);

    const [
      loclyPendingBefore,
      loclyPendingAfter,
      hostPendingBefore,
      hostPendingAfter,
    ] = [
      loclyStripeBalanceBefore,
      loclyStripeBalanceAfter,
      hostStripeBalanceBefore,
      hostStripeBalanceAfter,
    ].map(findBalance);

    expect(loclyPendingBefore.amount - loclyPendingAfter.amount).toBeCloseTo(0);

    expect(hostPendingAfter.amount - hostPendingBefore.amount).toBe(
      shipmentPrice.unit_amount,
    );
  });
});
