import {
  MiddlewareConsumer,
  Module,
  NestModule,
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

@Module({
  imports: [
    // TODO: { isGlobal: true } doesn't work — environment variables still undefined.
    ConfigModule.forRoot({ isGlobal: true }),
    MongoModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_LOCLY_CONNECTION_STRING'),
        dbName: configService.get<string>('MONGO_LOCLY_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    MongoModule.forFeature(['orders', 'customers', 'hosts']),
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get<string>('STRIPE_SECRET_API_TEST_KEY'),
        webhookConfig: {
          stripeWebhookSecret: configService.get<string>(
            'STRIPE_WEBHOOK_SECRET',
          ),
        },
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
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: 'stripe/webhook',
    });

    // Register global cookie parser middleware
    consumer
      .apply(cookieParser(this.configService.get<string>('COOKIE_SIGNING_KEY')))
      .forRoutes('*');
  }
}
