import { Module, Provider } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';

import { CustomerRepository } from '../../application/port/customer/CustomerRepository';
import { HostRepository } from '../../application/port/host/HostRepository';
import { OrderRepository } from '../../application/port/order/OrderRepository';
import { ConfirmOrder } from '../../application/services/ConfirmOrderService';
import { DraftOrder } from '../../application/services/DraftOrderService';
import { ConfirmOrderUseCase } from '../../domain/use-case/ConfirmOrderUseCase';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../persistence/customer/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../persistence/host/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../persistence/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';
import { MatchRecorder } from '../../application/port/MatchRecorder';
import { MatchMongoRecorderAdapter } from '../persistence/match/MatchMongoRecorderAdapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmOrderUseCaseService } from '../../domain/use-case/ConfirmOrderUseCaseService';
import { ConfirmOrderWebhookHandler } from '../../application/services/ConfirmOrderWebhookHandler';
import { ReceiveOrderHostUseCase } from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { ReceiveOrderHost } from '../../application/services/ReceiveOrderByHostService';

const persistenceProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMongoRepositoryAdapter },
  { provide: CustomerRepository, useClass: CustomerMongoRepositoryAdapter },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
  { provide: MatchRecorder, useClass: MatchMongoRecorderAdapter },
];

const useCaseProviders: Provider[] = [
  { provide: DraftOrderUseCase, useClass: DraftOrder },
  { provide: ConfirmOrderUseCase, useClass: ConfirmOrder },
  { provide: ConfirmOrderUseCaseService, useClass: ConfirmOrderWebhookHandler },
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
