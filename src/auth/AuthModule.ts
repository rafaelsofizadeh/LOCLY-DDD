import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomerModule } from '../customer/CustomerModule';
import { HostModule } from '../host/HostModule';
import { EmailModule } from '../infrastructure/email/EmailModule';
import { IEmailService } from '../infrastructure/email/IEmailService';
import { IRequestAuth } from './application/RequestAuth/IRequestAuth';
import { RequestAuth } from './application/RequestAuth/RequestAuth';
import { IVerifyAuth } from './application/VerifyAuth/IVerifyAuth';
import { VerificationTokenParamToBodyMiddleware } from './application/VerifyAuth/TokenParamToBodyMiddleware';
import { VerifyAuth } from './application/VerifyAuth/VerifyAuth';
import { AuthController } from './AuthController';
import { CookieAuthInterceptor } from './infrastructure/AuthInterceptor';
import { EmailAuthDeliveryStrategy } from './infrastructure/AuthDeliveryStrategy/EmailAuthDeliveryStrategy';
import { IAuthDeliveryStrategy } from './infrastructure/AuthDeliveryStrategy/IAuthDeliveryStrategy';
import { OutputAuthDeliveryStrategy } from './infrastructure/AuthDeliveryStrategy/OutputAuthDeliveryStrategy';

@Module({
  imports: [CustomerModule, HostModule, EmailModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CookieAuthInterceptor,
    },
    {
      provide: IAuthDeliveryStrategy,
      useFactory: async (
        configService: ConfigService,
        emailService: IEmailService,
      ) => {
        const nodeEnv = configService.get<string>('NODE_ENV');

        switch (nodeEnv) {
          case 'dev':
            return new OutputAuthDeliveryStrategy();
          case 'prod':
            return new EmailAuthDeliveryStrategy(emailService);
          default:
            throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
        }
      },
      inject: [ConfigService, IEmailService],
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
