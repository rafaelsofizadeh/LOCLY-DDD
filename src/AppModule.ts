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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoModule.forRoot(
      'mongodb+srv://rafasofizada:METUclass2022@cluster0.tcrn6.mongodb.net/test?authSource=admin&replicaSet=atlas-zrpmay-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true',
      'locly',
    ),
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
