import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomerModule } from '../customer/CustomerModule';
import { HostModule } from '../host/HostModule';
import { IRequestAuth } from './application/RequestAuth/IRequestAuth';
import { RequestAuth } from './application/RequestAuth/RequestAuth';
import { IVerifyAuth } from './application/VerifyAuth/IVerifyAuth';
import { VerificationTokenParamToBodyMiddleware } from './application/VerifyAuth/TokenParamToBodyMiddleware';
import { VerifyAuth } from './application/VerifyAuth/VerifyAuth';
import { AuthController } from './AuthController';
import { CookieAuthInterceptor } from './infrastructure/AuthInterceptor';
import { NotificationModule } from '../infrastructure/notification/NotificationModule';

@Module({
  imports: [CustomerModule, HostModule, NotificationModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CookieAuthInterceptor,
    },
    { provide: IRequestAuth, useClass: RequestAuth },
    { provide: IVerifyAuth, useClass: VerifyAuth },
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerificationTokenParamToBodyMiddleware)
      .forRoutes({ path: 'auth/:token', method: RequestMethod.GET });
  }
}
