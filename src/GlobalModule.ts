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
            return 'http://aqueous-caverns-91110.herokuapp.com';
          case 'dev':
            return 'http://localhost:3000';
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
