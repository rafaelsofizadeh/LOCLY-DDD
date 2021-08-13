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
import {
  applyRawBodyOnlyTo,
  JsonBodyMiddleware,
  RawBodyMiddleware,
} from '@golevelup/nestjs-webhooks';

import { OrderModule } from './order/OrderModule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerModule } from './customer/CustomerModule';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { AuthModule } from './auth/AuthModule';
import { HostModule } from './host/HostModule';
import { EmailModule } from './infrastructure/email/EmailModule';
import { ICustomerRepository } from './customer/persistence/ICustomerRepository';
import { CustomerMongoRepositoryAdapter } from './customer/persistence/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from './host/persistence/HostMongoRepositoryAdapter';
import { IHostRepository } from './host/persistence/IHostRepository';
import { IOrderRepository } from './order/persistence/IOrderRepository';
import { OrderMongoRepositoryAdapter } from './order/persistence/OrderMongoRepositoryAdapter';

const infrastructureModules: DynamicModule[] = [
  ConfigModule.forRoot({
    envFilePath: ['.main.env', '.app.env'],
  }),
  MongoModule.forRootAsync({
    useFactory: async (configService: ConfigService) => ({
      uri: configService.get<string>('MONGO_CONNECTION_STRING'),
      dbName:
        configService.get<string>('NODE_ENV') === 'prod'
          ? configService.get<string>('MONGO_PROD_DB_NAME')
          : configService.get<string>('MONGO_DEV_DB_NAME'),
    }),
    inject: [ConfigService],
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
  StripeModule.forRootAsync(StripeModule, {
    useFactory: async (configService: ConfigService) => {
      return {
        apiKey: configService.get<string>('STRIPE_SECRET_API_TEST_KEY'),
        webhookConfig: {
          stripeWebhookSecret: configService.get<string>(
            'STRIPE_WEBHOOK_SECRET',
          ),
        },
      };
    },
    inject: [ConfigService],
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
    EmailModule,
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
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: this.configService.get<string>('STRIPE_WEBHOOK_PATH'),
    });

    // Register global cookie parser middleware
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
