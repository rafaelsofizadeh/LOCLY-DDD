import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomerModule } from '../customer/CustomerModule';
import { HostModule } from '../host/HostModule';
import { IHostRepository } from '../host/persistence/IHostRepository';
import { EmailModule } from '../infrastructure/email/EmailModule';
import { IRequestAuthn } from './application/RequestAuthn/IRequestAuthn';
import { RequestAuthn } from './application/RequestAuthn/RequestAuthn';
import { IVerifyAuthn } from './application/VerifyAuthn/IVerifyAuthn';
import { VerificationTokenParamToBodyMiddleware } from './application/VerifyAuthn/TokenParamToBodyMiddleware';
import { VerifyAuthn } from './application/VerifyAuthn/VerifyAuthn';
import { AuthController } from './AuthController';
import { CookieAuthxInterceptor } from './infrastructure/AuthxInterceptor';

@Module({
  imports: [CustomerModule, HostModule, EmailModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      // TODO(?): only useFactory + inject works for instantiating CookieAuthxInterceptor,
      // otherwise dependencies are undefined
      useFactory: (
        configService: ConfigService,
        hostRepository: IHostRepository,
      ) => new CookieAuthxInterceptor(configService, hostRepository),
      inject: [ConfigService, IHostRepository],
    },
    { provide: IRequestAuthn, useClass: RequestAuthn },
    { provide: IVerifyAuthn, useClass: VerifyAuthn },
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerificationTokenParamToBodyMiddleware)
      .forRoutes({ path: 'auth/verify/:token', method: RequestMethod.GET });
  }
}
