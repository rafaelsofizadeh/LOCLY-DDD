import { Module, Provider } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';

import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { PreConfirmOrder } from '../../application/services/PreConfirmOrderService';
import { DraftOrder } from '../../application/services/DraftOrderService';
import { PreConfirmOrderUseCase } from '../../domain/use-case/PreConfirmOrderUseCase';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../persistence/customer/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../persistence/host/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../persistence/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmOrderUseCase } from '../../domain/use-case/ConfirmOrderUseCase';
import { ConfirmOrderWebhookHandler } from '../../application/services/ConfirmOrderService';
import { ReceiveOrderHostUseCase } from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { ReceiveOrderHost } from '../../application/services/ReceiveOrderByHostService';
import { EditOrder } from '../../application/services/EditOrderService';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { DeleteOrderUseCase } from '../../domain/use-case/DeleteOrderUseCase';
import { DeleteOrder } from '../../application/services/DeleteOrderService';

const persistenceProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMongoRepositoryAdapter },
  { provide: CustomerRepository, useClass: CustomerMongoRepositoryAdapter },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
];

const useCaseProviders: Provider[] = [
  { provide: DraftOrderUseCase, useClass: DraftOrder },
  { provide: EditOrderUseCase, useClass: EditOrder },
  { provide: DeleteOrderUseCase, useClass: DeleteOrder },
  { provide: PreConfirmOrderUseCase, useClass: PreConfirmOrder },
  { provide: ConfirmOrderUseCase, useClass: ConfirmOrderWebhookHandler },
  { provide: ReceiveOrderHostUseCase, useClass: ReceiveOrderHost },
];

// TODO(NOW): find a better place to initialize testing dependencies (through .env? npm scripts?)
// ATTENTION: Cool thing. Polymorphism (?) through interface injections.
const testProviders: Provider[] = [];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoModule.forFeature(['orders', 'customers', 'hosts', 'matches']),
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
