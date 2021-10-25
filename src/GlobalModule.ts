import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const DOMAIN = Symbol('DOMAIN');

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
  ],
  exports: [DOMAIN],
})
export class GlobalModule {}
