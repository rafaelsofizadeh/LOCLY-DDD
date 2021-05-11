import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import {
  applyRawBodyOnlyTo,
  JsonBodyMiddleware,
  RawBodyMiddleware,
} from '@golevelup/nestjs-webhooks';

import { OrderModule } from './order/OrderModule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerModule } from './customer/CustomerModule';
import { NestSessionOptions, SessionModule } from 'nestjs-session';
import { StripeModule } from '@golevelup/nestjs-stripe';

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
    SessionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<NestSessionOptions> => ({
        session: {
          secret: configService.get<string>('EXPRESS_SESSION_SIGNING_KEY'),
          resave: false,
          saveUninitialized: false,
        },
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
    CustomerModule,
    OrderModule,
    JsonBodyMiddleware,
    RawBodyMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: 'stripe/webhook',
    });
  }
}
