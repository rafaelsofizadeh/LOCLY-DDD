import supertest, { agent as requestAgent } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import {
  ConfirmedOrder,
  Order,
  OrderStatus,
} from '../../../src/order/entity/Order';
import { Country } from '../../../src/order/entity/Country';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { setupNestApp } from '../../../src/main';
import { UserType } from '../../../src/auth/entity/Token';
import {
  authorize,
  createConfirmedOrder,
  createTestCustomer,
  createTestHost,
} from '../utilities';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Host } from '../../../src/host/entity/Host';
import { IReceiveItem } from '../../../src/order/application/ReceiveItem/IReceiveItem';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import {
  FileUploadChunkMongoDocument,
  FileUploadMongoDocument,
} from '../../../src/order/persistence/OrderMongoMapper';
import { Collection } from 'mongodb';
import { getCollectionToken } from 'nest-mongodb';
import { AddItemPhotoRequest } from '../../../src/order/application/AddItemPhotos/IAddItemPhotos';
import { SubmitShipmentInfoResult } from '../../../src/order/application/SubmitShipmentInfo/ISubmitShipmentInfo';
import { isUUID } from '../../../src/common/domain';
import { uuidToMuuid } from '../../../src/common/persistence';

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof requestAgent>;

  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let orderRepository: IOrderRepository;

  let proofOfPaymentFileCollection: Collection<FileUploadMongoDocument>;
  let proofOfPaymentChunkCollection: Collection<FileUploadChunkMongoDocument>;

  let receiveItem: IReceiveItem;

  let order: ConfirmedOrder;
  const originCountry: Country = originCountriesAvailable[0];

  let customer: Customer;

  let host: Host;

  beforeAll(async () => {
    jest.setTimeout(30000);

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();

    customerRepository = await moduleRef.resolve(ICustomerRepository);
    hostRepository = await moduleRef.resolve(IHostRepository);
    orderRepository = await moduleRef.resolve(IOrderRepository);

    proofOfPaymentFileCollection = await moduleRef.resolve(
      getCollectionToken('host_shipment_payment_proofs.files'),
    );
    proofOfPaymentChunkCollection = await moduleRef.resolve(
      getCollectionToken('host_shipment_payment_proofs.chunks'),
    );

    receiveItem = await moduleRef.resolve(IReceiveItem);

    ({ customer } = await createTestCustomer(moduleRef, originCountry));
    ({ host } = await createTestHost(moduleRef, originCountry));

    ({ agent } = await authorize(app, moduleRef, host.email, UserType.Host));
  });

  const itemCountTestCases = [[1], [2]];

  async function beforeEachTest(
    itemCount: number,
    receivedCount: number = itemCount,
  ) {
    order = await createConfirmedOrder(moduleRef, orderRepository, {
      customer,
      host,
      originCountry,
      itemCount,
    });

    // slice(0, receivedCount) === [0, ..., receivedCount - 1]
    for (const receivedItem of order.items.slice(0, receivedCount)) {
      await receiveItem.execute({
        port: {
          orderId: order.id,
          itemId: receivedItem.id,
          hostId: host.id,
        },
      });

      order = (await orderRepository.findOrder({
        orderId: order.id,
      })) as ConfirmedOrder;

      const payload: AddItemPhotoRequest = {
        orderId: order.id,
        itemId: receivedItem.id,
      };

      await agent
        .post('/order/itemPhotos')
        .field('payload', JSON.stringify(payload))
        .attach('photos', join(__dirname, './addItemPhotos-test-image.png'));
    }
  }

  afterEach(
    async () =>
      await Promise.all([orderRepository.deleteOrder({ orderId: order.id })]),
  );

  afterAll(async () => {
    await Promise.all([
      hostRepository.deleteHost({ hostId: host.id }),
      customerRepository.deleteCustomer({ customerId: customer.id }),
    ]);

    await app.close();
  });

  it.each(itemCountTestCases)(
    'Successful (%i item(s) received and photographed)',
    async itemCount => {
      await beforeEachTest(itemCount);

      const payload = {
        orderId: order.id,
        totalWeight: 2000,
        shipmentCost: {
          amount: 100,
          currency: 'USD',
        },
        calculatorResultUrl: 'news.ycombinator.com',
        deliveryEstimateDays: 15,
      };

      const response: supertest.Response = await agent
        .post('/order/shipmentInfo')
        .field('payload', JSON.stringify(payload))
        .attach(
          'proofOfPayment',
          join(__dirname, './submitShipmentInfo-test-image.png'),
        );

      expect(response.status).toBe(HttpStatus.CREATED);

      const {
        id: fileId,
        name: fileName,
      } = response.body as SubmitShipmentInfoResult;

      expect(isUUID(fileId)).toBe(true);
      expect(isUUID(fileName)).toBe(true);

      const updatedOrder: Order = await orderRepository.findOrder({
        orderId: order.id,
      });

      const {
        orderId: matchOrderId,
        shipmentCost: finalShipmentCost,
        ...restMatch
      } = payload;

      expect(updatedOrder).toMatchObject({
        ...restMatch,
        finalShipmentCost,
        id: matchOrderId,
        proofOfPayment: fileId,
        status: OrderStatus.Finalized,
      });

      const fileUploadRepoResult: FileUploadMongoDocument[] = await proofOfPaymentFileCollection
        .find({ _id: uuidToMuuid(fileId) })
        .toArray();
      expect(fileUploadRepoResult.length).toBe(1);
    },
  );

  it.each(itemCountTestCases)(
    'Fail (%i item(s) received but not all photographed)',
    async function(itemCount) {
      await beforeEachTest(itemCount, itemCount - 1);

      const payload = {
        orderId: order.id,
        totalWeight: 2000,
        shipmentCost: {
          amount: 100,
          currency: 'USD',
        },
        calculatorResultUrl: 'news.ycombinator.com',
        deliveryEstimateDays: 15,
      };

      const response: supertest.Response = await agent
        .post('/order/shipmentInfo')
        .field('payload', JSON.stringify(payload))
        .attach(
          'proofOfPayment',
          join(__dirname, './submitShipmentInfo-test-image.png'),
        );

      // beforeEachTest -> receivedCount passed: itemCount - 1 => 1 item will not be received
      expect(response.body.data.unfinalizedItems.length).toBe(1);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);

      const updatedOrder: Order = await orderRepository.findOrder({
        orderId: order.id,
      });

      expect(updatedOrder.status).toBe(OrderStatus.Confirmed);
      expect(updatedOrder.finalShipmentCost).toBeUndefined();
      expect(updatedOrder.totalWeight).toBeUndefined();
      expect(updatedOrder.calculatorResultUrl).toBeUndefined();
      expect(updatedOrder.deliveryEstimateDays).toBeUndefined();
      expect(updatedOrder.proofOfPayment).toBeUndefined();
    },
  );
});
