import { StripeModule } from '@golevelup/nestjs-stripe';
import { forwardRef, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoModule } from 'nest-mongodb';
import { OrderModule } from '../order/OrderModule';
import { CreateHost } from './application/CreateHost/CreateHost';
import { ICreateHost } from './application/CreateHost/ICreateHost';
import { GetHost } from './application/GetHost/GetHost';
import { IGetHost } from './application/GetHost/IGetHost';
import { GetHostDashboardLinks } from './application/GetHostDashboardLinks/GetHostDashboardLinks';
import { IGetHostDashboardLinks } from './application/GetHostDashboardLinks/IGetHostDashboardLinks';
import { GetHostUpsert } from './application/GetHostUpsert/GetHostUpsert';
import { IGetHostUpsert } from './application/GetHostUpsert/IGetHostUpsert';
import { HostController } from './HostController';
import { HostMongoRepositoryAdapter } from './persistence/HostMongoRepositoryAdapter';
import { IHostRepository } from './persistence/IHostRepository';

const useCaseProviders: Provider[] = [
  { provide: ICreateHost, useClass: CreateHost },
  { provide: IGetHost, useClass: GetHost },
  { provide: IGetHostUpsert, useClass: GetHostUpsert },
  { provide: IGetHostDashboardLinks, useClass: GetHostDashboardLinks },
];

const persistenceProviders: Provider[] = [
  {
    provide: IHostRepository,
    useClass: HostMongoRepositoryAdapter,
  },
];

const providers: Provider[] = [...useCaseProviders, ...persistenceProviders];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoModule.forFeature(['hosts']),
    forwardRef(() => OrderModule),
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
  ],
  controllers: [HostController],
  providers,
  exports: [...persistenceProviders, ...useCaseProviders],
})
export class HostModule {}
