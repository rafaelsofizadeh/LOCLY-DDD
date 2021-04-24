import {
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

import { OrderModule } from './order/infrastructure/di/OrderModule';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // { isGlobal: true } doesn't work — environment variables still undefined.
    ConfigModule.forRoot(),
    MongoModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_LOCLY_CONNECTION_STRING'),
        dbName: configService.get<string>('MONGO_LOCLY_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    OrderModule,
    JsonBodyMiddleware,
    RawBodyMiddleware,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: 'stripe/webhook',
    });
  }
}
