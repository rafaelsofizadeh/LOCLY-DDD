import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const DOMAIN = Symbol('DOMAIN');
export const COOKIE_CORS_CONFIG = Symbol('COOKIE_CORS_CONFIG');

@Global()
@Module({
  providers: [
    {
      provide: DOMAIN,
      useFactory: (configService: ConfigService) => {
        switch (configService.get('NODE_ENV')) {
          case 'prod':
            return configService.get('DOMAIN_PROD');
          case 'dev':
            return configService.get('DOMAIN_DEV');
          default:
            throw new Error('Wrong NODE_ENV value');
        }
      },
      inject: [ConfigService],
    },
    {
      provide: COOKIE_CORS_CONFIG,
      useFactory: (configService: ConfigService) => ({
          // Only 'SameSite=None; Secure' cookies are forwarded in third-party requests,
          // which is necessary in production to allow the front-end on domain X (see main.ts :: enableCors config)
          // to send request to server on domain Y:
          // https://stackoverflow.com/a/46412839/6539857
          // https://digiday.com/media/what-is-chrome-samesite/
          secure: configService.get('NODE_ENV') === 'prod' ? true : false,
          sameSite: 'none' as const
      }),
      inject: [ConfigService],
    },
  ],
  exports: [DOMAIN, COOKIE_CORS_CONFIG],
})
export class GlobalModule {}
