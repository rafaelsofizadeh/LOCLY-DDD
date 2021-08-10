import { readFileSync, writeFileSync } from 'fs';
import child_process from 'child_process';
import path from 'path';
import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Host } from '../../../src/host/entity/Host';

import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Country } from '../../../src/order/entity/Country';
import { isString } from 'class-validator';
import {
  OrderStatus,
  FinalizedOrder,
  PaidOrder,
} from '../../../src/order/entity/Order';
import { ConfigService } from '@nestjs/config';
import { setupNestApp } from '../../../src/main';
import {
  authorize,
  createFinalizedOrder,
  createTestCustomer,
  createTestHost,
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

describe('Confirm Order – POST /order/confirm', () => {
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
    // Setting timeout in before*(): https://stackoverflow.com/a/67392078/6539857
    // https://stackoverflow.com/a/49864436/6539857
    jest.setTimeout(50000);

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(undefined, {
      bodyParser: false,
    });
    await setupNestApp(app);
    await app.init();

    stripe = await moduleRef.resolve(STRIPE_CLIENT_TOKEN);
    configService = await moduleRef.resolve(ConfigService);

    orderRepository = await moduleRef.resolve(IOrderRepository);
    deleteOrder = await moduleRef.resolve(IDeleteOrder);

    ({ host, deleteHost } = await createTestHost(moduleRef, originCountry));
    ({ customer, deleteCustomer } = await createTestCustomer(moduleRef));

    console.log(host);

    ({ agent } = await authorize(app, moduleRef, host.email, UserType.Host));

    stripeListener = child_process.spawn('stripe', [
      'listen',
      '--forward-to',
      `localhost:3000/${configService.get<string>('STRIPE_WEBHOOK_PATH')}`,
    ]);

    await new Promise(resolve => {
      const stdHandler = (data: Buffer) => {
        if (data.toString().includes('Ready!')) {
          return resolve('Stripe finished');
        }
      };

      stripeListener.stdout.on('data', stdHandler);
      stripeListener.stderr.on('data', stdHandler);
    });
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
      // deleteOrder.execute({
      //   port: { customerId: customer.id, orderId: order.id },
      // }),
    ]);
  });

  afterAll(async () => {
    await Promise.allSettled([
      // deleteHost.execute({ port: { hostId: host.id } }),
      // deleteCustomer.execute({ port: { customerId: customer.id } }),
    ]);

    stripeListener.kill();
    await app.close();
  });

  it(`Matches Order with a Host, completes Stripe checkout for Locly service fee payment`, async () => {
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

    const { checkoutId } = response.body as PayShipmentResult;

    expect(checkoutId).toBeDefined();
    expect(isString(checkoutId)).toBe(true);
    expect(checkoutId.slice(0, 2)).toBe('cs'); // "Checkout Session"

    updatedStripeCheckoutSessionInTestPage(checkoutId);
    await fillStripeCheckoutForm();
    await new Promise(res => setTimeout(res, 15000));
    await page.screenshot({
      path: './test/e2e/order/stripe_form_result.png',
      fullPage: true,
    });

    const updatedOrder = (await orderRepository.findOrder({
      orderId: order.id,
    })) as PaidOrder;

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.status).toBe(OrderStatus.Paid);

    const loclyStripeBalanceAfter: Stripe.Balance = await stripe.balance.retrieve();
    const hostStripeBalanceAfter: Stripe.Balance = await stripe.balance.retrieve(
      { stripeAccount: host.stripeAccountId },
    );

    console.log(
      'BEFORE:',
      loclyStripeBalanceBefore,
      '\n AFTER:',
      loclyStripeBalanceAfter,
    );
    console.log(
      '\nBEFORE:',
      hostStripeBalanceBefore,
      '\n AFTER:',
      hostStripeBalanceAfter,
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

function updatedStripeCheckoutSessionInTestPage(checkoutId: string) {
  const checkoutPagePath = path.join(__dirname, './CheckoutPage.html');

  const checkoutPage: string = readFileSync(checkoutPagePath, 'utf8');

  const updatedStripeCheckoutSessionFileContent = checkoutPage.replace(
    /cs_test_[\w\d]+/g,
    checkoutId,
  );

  writeFileSync(
    checkoutPagePath,
    updatedStripeCheckoutSessionFileContent,
    'utf8',
  );
}

// TODO: Retry on Stripe form error (will eliminate majority of test failures)
async function fillStripeCheckoutForm(): Promise<void> {
  const typingOptions = { delay: 300 };
  const testCardNumber = '4242424242424242';
  const testCardExpirty = '0424';
  const testCardCvc = '100';
  const testNameOnCard = 'TEST TESTOV';

  await page.goto(
    'file:///Users/rafaelsofizadeh/Documents/Developer/LOCLY-DDD/test/e2e/order/CheckoutPage.html',
  );
  await page.click('#checkout-button');

  await page.waitForSelector('#cardNumber');
  await page.screenshot({
    path: './test/e2e/order/stripe_form.png',
    fullPage: true,
  });
  await page.click('#cardNumber');
  await page.focus('#cardNumber');
  await page.keyboard.type(testCardNumber, typingOptions);

  await page.click('#cardExpiry');
  await page.focus('#cardExpiry');
  await page.keyboard.type(testCardExpirty, typingOptions);

  await page.click('#cardCvc');
  await page.focus('#cardCvc');
  await page.keyboard.type(testCardCvc, typingOptions);

  await page.click('#billingName');
  await page.focus('#billingName');
  await page.keyboard.type(testNameOnCard, typingOptions);

  await page.evaluate(() => {
    (document.getElementsByClassName(
      'SubmitButton-IconContainer',
    )[0] as HTMLElement).click();
  });
}
