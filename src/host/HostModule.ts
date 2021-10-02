import { Module, Provider } from '@nestjs/common';
import { CreateHost } from './application/CreateHost/CreateHost';
import { ICreateHost } from './application/CreateHost/ICreateHost';
import { DeleteHost } from './application/DeleteHost/DeleteHost';
import { IDeleteHost } from './application/DeleteHost/IDeleteHost';
import { EditHost } from './application/EditHost/EditHost';
import { IEditHost } from './application/EditHost/IEditHost';
import { GetHost } from './application/GetHost/GetHost';
import { IGetHost } from './application/GetHost/IGetHost';
import { GetHostAccountLink } from './application/GetHostAccountLink/GetHostAccountLink';
import { IGetHostAccountLink } from './application/GetHostAccountLink/IGetHostAccountLink';
import { GetHostUpsert } from './application/GetHostUpsert/GetHostUpsert';
import { IGetHostUpsert } from './application/GetHostUpsert/IGetHostUpsert';
import { ISetHostAvailability } from './application/SetHostAvailability/ISetHostAvailability';
import { SetHostAvailability } from './application/SetHostAvailability/SetHostAvailability';
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
  { provide: IEditHost, useClass: EditHost },
  { provide: IDeleteHost, useClass: DeleteHost },
  { provide: ISetHostAvailability, useClass: SetHostAvailability },
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
