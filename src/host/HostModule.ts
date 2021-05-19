import { Module, Provider } from '@nestjs/common';
import { CreateHost } from './application/CreateHost/CreateHost';
import { ICreateHost } from './application/CreateHost/ICreateHost';
import { GetHost } from './application/GetHost/GetHost';
import { IGetHost } from './application/GetHost/IGetHost';
import { GetHostAccountLink } from './application/GetHostAccountLink/GetHostAccountLink';
import { IGetHostAccountLink } from './application/GetHostAccountLink/IGetHostAccountLink';
import { GetHostUpsert } from './application/GetHostUpsert/GetHostUpsert';
import { IGetHostUpsert } from './application/GetHostUpsert/IGetHostUpsert';
import { IUpdateHostAccount } from './application/StripeAccountUpdatedWebhook/handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler';
import { UpdateHostAccountHandler } from './application/StripeAccountUpdatedWebhook/handlers/UpdateHostAccountHandler/UpdateHostAccountHandler';
import { IStripeAccountUpdatedWebhook } from './application/StripeAccountUpdatedWebhook/IStripeAccountUpdatedWebhook';
import { StripeAccountUpdatedWebhook } from './application/StripeAccountUpdatedWebhook/StripeAccountUpdatedWebhook';
import { HostController } from './HostController';

const useCaseProviders: Provider[] = [
  { provide: ICreateHost, useClass: CreateHost },
  { provide: IGetHost, useClass: GetHost },
  { provide: IGetHostUpsert, useClass: GetHostUpsert },
  { provide: IGetHostAccountLink, useClass: GetHostAccountLink },
  {
    provide: IStripeAccountUpdatedWebhook,
    useClass: StripeAccountUpdatedWebhook,
  },
  { provide: IUpdateHostAccount, useClass: UpdateHostAccountHandler },
];

@Module({
  controllers: [HostController],
  providers: [...useCaseProviders],
  exports: [...useCaseProviders],
})
export class HostModule {}
