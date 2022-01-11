import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  RequestMethod,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';
import {
  applyRawBodyOnlyTo,
  JsonBodyMiddleware,
  RawBodyMiddleware,
} from '@golevelup/nestjs-webhooks';

import config from '../main.configuration';

import { OrderModule } from './order/OrderModule';
import { CustomerModule } from './customer/CustomerModule';
import { AuthModule } from './auth/AuthModule';
import { HostModule } from './host/HostModule';
import { ICustomerRepository } from './customer/persistence/ICustomerRepository';
import { CustomerMongoRepositoryAdapter } from './customer/persistence/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from './host/persistence/HostMongoRepositoryAdapter';
import { IHostRepository } from './host/persistence/IHostRepository';
import { IOrderRepository } from './order/persistence/IOrderRepository';
import { OrderMongoRepositoryAdapter } from './order/persistence/OrderMongoRepositoryAdapter';
import { NotificationModule } from './infrastructure/notification/NotificationModule';

const { mongo, stripe } = config;

const infrastructureModules: DynamicModule[] = [
  MongoModule.forRoot(mongo.connectionString, mongo.dbName, {
    useUnifiedTopology: true,
  }),
  MongoModule.forFeature([
    'orders',
    'customers',
    'hosts',
    // TODO: Configure bucket name (host_item_photo)
    'host_item_photos.files',
    'host_item_photos.chunks',
    'host_shipment_payment_proofs.files',
    'host_shipment_payment_proofs.chunks',
  ]),
  StripeModule.forRoot(StripeModule, {
    apiKey: stripe.apiKey,
    apiVersion: stripe.apiVersion,
    webhookConfig: {
      stripeWebhookSecret: stripe.webhook.secret,
    },
  }),
];

const persistenceProviders: Provider[] = [
  {
    provide: ICustomerRepository,
    useClass: CustomerMongoRepositoryAdapter,
  },
  {
    provide: IHostRepository,
    useClass: HostMongoRepositoryAdapter,
  },
  { provide: IOrderRepository, useClass: OrderMongoRepositoryAdapter },
];

@Global()
@Module({
  imports: [
    ...infrastructureModules,
    NotificationModule,
    AuthModule,
    HostModule,
    CustomerModule,
    OrderModule,
    JsonBodyMiddleware,
    RawBodyMiddleware,
  ],
  providers: [...persistenceProviders],
  exports: [...persistenceProviders, ...infrastructureModules],
})
export class AppModule implements NestModule {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: stripe.webhook.path,
    });

    // Register global cookie parser middleware
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
