import { Module, Provider } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';

import { HostFixture } from '../../../../test/e2e/fixture/HostFixture';
import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostMatcher } from '../../application/port/HostMatcher';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { ShipmentCostCalculator } from '../../application/port/ShipmentCostCalculator';
import { ShipmentCostCalculatorService } from '../../application/services/ShipmentCostCalculatorService';
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
import { ConfigModule } from '@nestjs/config';
import { MatchFixture } from '../../../../test/e2e/fixture/MatchFixture';

const persistenceProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMongoRepositoryAdapter },
  { provide: CustomerRepository, useClass: CustomerMongoRepositoryAdapter },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
  { provide: MatchCache, useClass: MatchMongoCacheAdapter },
];

const infrastructureProviders: Provider[] = [
  { provide: ShipmentCostCalculator, useClass: ShipmentCostCalculatorService },
  { provide: HostMatcher, useClass: HostMatcherService },
];

const useCaseProviders: Provider[] = [
  { provide: CreateOrderUseCase, useClass: CreateOrder },
  { provide: ConfirmOrderUseCase, useClass: ConfirmOrder },
];

// TODO(NOW): find a better place to initialize testing dependencies
// ATTENTION: Cool thing. Polymorphism (?) through interface injections.
const testProviders: Provider[] = [
  { provide: HostFixture, useClass: HostMongoRepositoryAdapter },
  { provide: MatchFixture, useClass: MatchMongoCacheAdapter },
];

@Module({
  imports: [
    // { isGlobal: true } doesn't work — environment variables still undefined.
    ConfigModule.forRoot(),
    MongoModule.forFeature(['orders', 'customers', 'hosts', 'matches']),
    EventEmitterModule.forRoot(),
    StripeModule.forRoot(StripeModule, {
      apiKey: process.env.STRIPE_SECRET_API_TEST_KEY,
      webhookConfig: {
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
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
