import { forwardRef, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from 'nest-mongodb';
import { OrderModule } from '../order/OrderModule';
import { CreateHost } from './application/CreateHost/CreateHost';
import { ICreateHost } from './application/CreateHost/ICreateHost';
import { GetHost } from './application/GetHost/GetHost';
import { IGetHost } from './application/GetHost/IGetHost';
import { GetHostUpsert } from './application/GetHostUpsert/GetHostUpsert';
import { IGetHostUpsert } from './application/GetHostUpsert/IGetHostUpsert';
import { HostMongoRepositoryAdapter } from './persistence/HostMongoRepositoryAdapter';
import { IHostRepository } from './persistence/IHostRepository';

const useCaseProviders: Provider[] = [
  { provide: ICreateHost, useClass: CreateHost },
  { provide: IGetHost, useClass: GetHost },
  { provide: IGetHostUpsert, useClass: GetHostUpsert },
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
  ],
  providers,
  exports: [...persistenceProviders, ...useCaseProviders],
})
export class HostModule {}
