import supertest, { agent as requestAgent } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Order } from '../../../src/order/entity/Order';
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
import { Item } from '../../../src/order/entity/Item';
import { Collection } from 'mongodb';
import {
  FileUploadChunkMongoDocument,
  FileUploadMongoDocument,
} from '../../../src/order/persistence/OrderMongoMapper';
import { getCollectionToken } from 'nest-mongodb';
import {
  AddItemPhotoRequest,
  AddItemPhotosResult,
  maxSimulataneousPhotoCount,
} from '../../../src/order/application/AddItemPhotos/IAddItemPhotos';
import { isUUID, UUID } from '../../../src/common/domain';
import { uuidToMuuid } from '../../../src/common/persistence';

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof requestAgent>;

  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let orderRepository: IOrderRepository;

  let photoFileCollection: Collection<FileUploadMongoDocument>;
  let photoChunkCollection: Collection<FileUploadChunkMongoDocument>;

  let receiveItem: IReceiveItem;

  let order: Order;
  let receivedItem: Item;
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

    photoFileCollection = await moduleRef.resolve(
      getCollectionToken('host_item_photos.files'),
    );
    photoChunkCollection = await moduleRef.resolve(
      getCollectionToken('host_item_photos.chunks'),
    );

    receiveItem = await moduleRef.resolve(IReceiveItem);

    ({ customer } = await createTestCustomer(moduleRef, originCountry));
    ({ host } = await createTestHost(
      moduleRef,

      originCountry,
    ));

    ({ agent } = await authorize(app, moduleRef, host.email, UserType.Host));

    order = await createConfirmedOrder(moduleRef, orderRepository, {
      customer,
      host,
      originCountry,
    });
  });

  afterAll(async () => {
    await Promise.all([
      hostRepository.deleteHost({ hostId: host.id }),
      customerRepository.deleteCustomer({ customerId: customer.id }),
      orderRepository.deleteOrder({ orderId: order.id }),
    ]);

    await app.close();
  });

  it('Adds 1 item photo', async () => {
    // Item needs to be received before uploading an image
    receivedItem = order.items[0];

    expect(receivedItem.photoIds).toBeUndefined();

    await receiveItem.execute({
      port: {
        orderId: order.id,
        itemId: receivedItem.id,
        hostId: host.id,
      },
    });

    order = await orderRepository.findOrder({
      orderId: order.id,
    });

    const payload: AddItemPhotoRequest = {
      orderId: order.id,
      itemId: receivedItem.id,
    };

    const response: supertest.Response = await agent
      .post('/order/itemPhotos')
      .field('payload', JSON.stringify(payload))
      .attach('photos', join(__dirname, './addItemPhotos-test-image.png'));

    expect(response.status).toBe(HttpStatus.CREATED);

    const [
      { id: photoId, name: photoName },
    ] = response.body as AddItemPhotosResult;

    expect(isUUID(photoId)).toBe(true);
    expect(isUUID(photoName)).toBe(true);

    const updatedOrder: Order = await orderRepository.findOrder({
      orderId: order.id,
    });
    const updatedItem: Item = updatedOrder.items.find(
      ({ id }) => id === receivedItem.id,
    );

    expect(updatedItem.photoIds.length).toBe(1);
    expect(updatedItem.photoIds[0]).toBe(photoId);

    const photoUploadRepoResult: FileUploadMongoDocument[] = await photoFileCollection
      .find({ _id: uuidToMuuid(photoId) })
      .toArray();
    expect(photoUploadRepoResult.length).toBe(1);

    const photoDocument: FileUploadMongoDocument = photoUploadRepoResult[0];

    order = updatedOrder;
    receivedItem = updatedItem;
  });

  it(`Adds ${maxSimulataneousPhotoCount} more item photos`, async () => {
    expect(receivedItem.photoIds.length).toBe(1);

    const payload: AddItemPhotoRequest = {
      orderId: order.id,
      itemId: receivedItem.id,
    };

    const request = agent
      .post('/order/itemPhotos')
      .field('payload', JSON.stringify(payload));

    for (let i = 0; i < maxSimulataneousPhotoCount; i++) {
      request.attach(
        'photos',
        join(__dirname, './addItemPhotos-test-image.png'),
      );
    }

    const response: supertest.Response = await request;

    expect(response.status).toBe(HttpStatus.CREATED);

    const AddItemPhotosResult = response.body as AddItemPhotosResult;

    expect(AddItemPhotosResult.length).toBe(maxSimulataneousPhotoCount);

    expect(
      AddItemPhotosResult.every(({ id, name }) => isUUID(id) && isUUID(name)),
    ).toBe(true);

    const updatedOrder: Order = await orderRepository.findOrder({
      orderId: order.id,
    });
    const updatedItem: Item = updatedOrder.items.find(
      ({ id }) => id === receivedItem.id,
    );

    const newPhotosLength = 1 + maxSimulataneousPhotoCount;

    expect(updatedItem.photoIds.length).toBe(newPhotosLength);

    const resultPhotoIds: UUID[] = AddItemPhotosResult.map(({ id }) => id);
    expect(
      resultPhotoIds.every(photoId => updatedItem.photoIds.includes(photoId)),
    ).toBe(true);

    const photoUploadRepoResult: FileUploadMongoDocument[] = await photoFileCollection
      .find({ _id: { $in: updatedItem.photoIds.map(uuidToMuuid) } })
      .toArray();
    expect(photoUploadRepoResult.length).toBe(newPhotosLength);

    order = updatedOrder;
    receivedItem = updatedItem;
  });

  it(`Doesn't add more than ${maxSimulataneousPhotoCount} item photos`, async () => {
    expect(receivedItem.receivedDate).toBeDefined();
    expect(receivedItem.photoIds.length).toBe(1 + maxSimulataneousPhotoCount);

    const payload: AddItemPhotoRequest = {
      orderId: order.id,
      itemId: receivedItem.id,
    };

    const request = agent
      .post('/order/itemPhotos')
      .field('payload', JSON.stringify(payload));

    const repeats = 5;
    for (let i = 0; i < repeats; i++) {
      request.attach(
        'photos',
        join(__dirname, './addItemPhotos-test-image.png'),
      );
    }

    const response: supertest.Response = await request;

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    const updatedOrder: Order = await orderRepository.findOrder({
      orderId: order.id,
    });
    const updatedItem: Item = updatedOrder.items.find(
      ({ id }) => id === receivedItem.id,
    );

    const newPhotosLength = 1 + maxSimulataneousPhotoCount;

    expect(updatedItem.photoIds.length).toBe(newPhotosLength);
  });

  // TODO: File extension, size
});
