import { Module, Provider } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';

import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostMatcher } from '../../application/port/HostMatcher';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { ConfirmOrder } from '../../application/services/ConfirmOrderService';
import { CreateOrder } from '../../application/services/CreateOrderService';
import { HostMatcherService } from '../../application/services/HostMatcherService';
import { ConfirmOrderUseCase } from '../../domain/use-case/ConfirmOrderUseCase';
import { CreateOrderUseCase } from '../../domain/use-case/CreateOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../persistence/customer/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../persistence/host/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../persistence/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';
import { MatchCache } from '../../application/port/MatchCache';
import { MatchMongoCacheAdapter } from '../persistence/match/MatchMongoCacheAdapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmOrderUseCaseService } from '../../domain/use-case/ConfirmOrderUseCaseService';
import { ConfirmOrderWebhookHandler } from '../../application/services/ConfirmOrderWebhookHandler';
import { ReceiveOrderHostUseCase } from '../../domain/use-case/ReceiveOrderByHostUseCase';
import { ReceiveOrderHost } from '../../application/services/ReceiveOrderByHostService';

const persistenceProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMongoRepositoryAdapter },
  { provide: CustomerRepository, useClass: CustomerMongoRepositoryAdapter },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
  { provide: MatchCache, useClass: MatchMongoCacheAdapter },
];

const infrastructureProviders: Provider[] = [
  { provide: HostMatcher, useClass: HostMatcherService },
];

const useCaseProviders: Provider[] = [
  { provide: CreateOrderUseCase, useClass: CreateOrder },
  { provide: ConfirmOrderUseCase, useClass: ConfirmOrder },
  { provide: ConfirmOrderUseCaseService, useClass: ConfirmOrderWebhookHandler },
  { provide: ReceiveOrderHostUseCase, useClass: ReceiveOrderHost },
];

// TODO(NOW): find a better place to initialize testing dependencies
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
  providers: [
    ...persistenceProviders,
    ...useCaseProviders,
    ...infrastructureProviders,
    ...testProviders,
  ],
})
export class OrderModule {}
