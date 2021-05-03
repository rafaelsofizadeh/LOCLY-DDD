import { Module, Provider } from '@nestjs/common';
import { getDbToken, MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';

import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { PreConfirmOrderService } from '../../application/services/PreConfirmOrderService';
import { DraftOrderService } from '../../application/services/DraftOrderService';
import { PreConfirmOrderUseCase } from '../../domain/use-case/PreConfirmOrderUseCase';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../persistence/customer/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../persistence/host/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../persistence/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmOrderUseCase } from '../../domain/use-case/ConfirmOrderUseCase';
import { ConfirmOrderWebhookHandler } from '../../application/services/ConfirmOrderService';
import { ReceiveOrderItemUseCase } from '../../domain/use-case/ReceiveOrderItemUseCase';
import { ReceiveOrderItemService } from '../../application/services/ReceiveOrderItemService';
import { EditOrderService } from '../../application/services/EditOrderService';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { DeleteOrderUseCase } from '../../domain/use-case/DeleteOrderUseCase';
import { DeleteOrderService } from '../../application/services/DeleteOrderService';
import { ItemPhotoStorage } from '../../../common/persistence';
import { Db } from 'mongodb';

const persistenceProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMongoRepositoryAdapter },
  { provide: CustomerRepository, useClass: CustomerMongoRepositoryAdapter },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
];

const useCaseProviders: Provider[] = [
  { provide: DraftOrderUseCase, useClass: DraftOrderService },
  { provide: EditOrderUseCase, useClass: EditOrderService },
  { provide: DeleteOrderUseCase, useClass: DeleteOrderService },
  { provide: PreConfirmOrderUseCase, useClass: PreConfirmOrderService },
  { provide: ConfirmOrderUseCase, useClass: ConfirmOrderWebhookHandler },
  { provide: ReceiveOrderItemUseCase, useClass: ReceiveOrderItemService },
];
];

// TODO(NOW): find a better place to initialize testing dependencies (through .env? npm scripts?)
// ATTENTION: Cool thing. Polymorphism (?) through interface injections.
const testProviders: Provider[] = [];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoModule.forFeature(['orders', 'customers', 'hosts']),
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
  controllers: [OrderController],
  providers: [...persistenceProviders, ...useCaseProviders, ...testProviders],
})
export class OrderModule {}
