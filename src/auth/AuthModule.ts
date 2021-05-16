import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CustomerModule } from '../customer/CustomerModule';
import { HostModule } from '../host/HostModule';
import { EmailModule } from '../infrastructure/email/EmailModule';
import { IRequestAuthn } from './application/RequestAuthn/IRequestAuthn';
import { RequestAuthn } from './application/RequestAuthn/RequestAuthn';
import { IVerifyAuthn } from './application/VerifyAuthn/IVerifyAuthn';
import { VerificationTokenParamToBodyMiddleware } from './application/VerifyAuthn/TokenParamToBodyMiddleware';
import { VerifyAuthn } from './application/VerifyAuthn/VerifyAuthn';
import { AuthController } from './AuthController';
import { AuthxInterceptorFactory } from './infrastructure/AuthxInterceptor';

@Module({
  imports: [CustomerModule, HostModule, EmailModule],
  controllers: [AuthController],
  providers: [
    AuthxInterceptorFactory,
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
