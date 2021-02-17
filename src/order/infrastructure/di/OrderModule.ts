import { Module, Provider } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoModule } from 'nest-mongodb';
import { HostFixture } from '../../../../test/e2e/fixture/HostFixture';
import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostMatcher } from '../../application/port/HostMatcher';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { ShipmentCostCalculator } from '../../application/port/ShipmentCostCalculator';
import { CalculateShipmentCost } from '../../application/services/CalculateShipmentCostService';
import { ConfirmOrder } from '../../application/services/ConfirmOrderService';
import { CreateOrder } from '../../application/services/CreateOrderService';
import { MatchHost } from '../../application/services/MatchHostService';
import { ConfirmOrderUseCase } from '../../domain/use-case/confirm-order/ConfirmOrderUseCase';
import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../repository/customer/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../repository/host/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../repository/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';

const persistenceProviders: Provider[] = [
  {
    provide: OrderRepository,
    useClass: OrderMongoRepositoryAdapter,
  },
  {
    provide: CustomerRepository,
    useClass: CustomerMongoRepositoryAdapter,
  },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
];

const infrastructureProviders: Provider[] = [
  { provide: ShipmentCostCalculator, useClass: CalculateShipmentCost },
  { provide: HostMatcher, useClass: MatchHost },
];

const useCaseProviders: Provider[] = [
  {
    provide: CreateOrderUseCase,
    useClass: CreateOrder,
  },
  {
    provide: ConfirmOrderUseCase,
    useClass: ConfirmOrder,
  },
];

// TODO(NOW): find a better place to initialize testing dependencies
// ATTENTION: Cool thing. Polymorphism (?) through interface injections.
const testProviders: Provider[] = [
  {
    provide: HostFixture,
    useClass: HostMongoRepositoryAdapter,
  },
];

@Module({
  imports: [
    MongoModule.forFeature(['orders', 'customers', 'hosts']),
    EventEmitterModule.forRoot(),
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
