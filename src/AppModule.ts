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
  ConfigModule.forRoot(),
  MongoModule.forFeature(['orders', 'customers', 'hosts']),
  StripeModule.forRootAsync(StripeModule, {
    useFactory: async (configService: ConfigService) => ({
      apiKey: configService.get<string>('STRIPE_SECRET_API_TEST_KEY'),
      webhookConfig: {
        stripeWebhookSecret: configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      },
    }),
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
    MongoModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_LOCLY_CONNECTION_STRING'),
        dbName: configService.get<string>('MONGO_LOCLY_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
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
    consumer
      .apply(cookieParser(this.configService.get<string>('COOKIE_SIGNING_KEY')))
      .forRoutes('*');
  }
}
