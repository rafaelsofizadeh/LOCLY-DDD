import { Module, Provider } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoModule } from 'nest-mongodb';
import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostMatcher } from '../../application/port/HostMatcher';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { ShipmentCostCalculator } from '../../application/port/ShipmentCostCalculator';
import { CalculateShipmentCost } from '../../application/services/CalculateShipmentCostService';
import { CreateOrder } from '../../application/services/CreateOrderService';
import { MatchHost } from '../../application/services/MatchHostService';
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
];

@Module({
  imports: [
    MongoModule.forFeature(['orders', 'customers']),
    EventEmitterModule.forRoot(),
  ],
  controllers: [OrderController],
  providers: [
    ...persistenceProviders,
    ...useCaseProviders,
    ...infrastructureProviders,
  ],
  exports: [
    OrderRepository,
    CustomerRepository,
    CreateOrderUseCase,
    ShipmentCostCalculator,
  ],
})
export class OrderModule {}
