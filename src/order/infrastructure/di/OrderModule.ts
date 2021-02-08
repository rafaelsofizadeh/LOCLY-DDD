import { Module, Provider } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { CustomerRepository } from '../../application/port/CustomerRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { ShipmentCostCalculator } from '../../application/port/ShipmentCostCalculator';
import { CreateOrder } from '../../application/services/CreateOrderService';
import { CreateOrderUseCase } from '../../domain/use-case/create-order/CreateOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../repository/customer/CustomerMongoRepositoryAdapter';
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
];
const infrastructureProviders: Provider[] = [
  { provide: ShipmentCostCalculator, useValue: 'shipment' },
];

const useCaseProviders: Provider[] = [
  {
    provide: CreateOrderUseCase,
    useClass: CreateOrder,
  },
];

@Module({
  imports: [MongoModule.forFeature(['orders', 'customers'])],
  controllers: [OrderController],
  providers: [...persistenceProviders, ...useCaseProviders],
})
export class OrderModule {}
