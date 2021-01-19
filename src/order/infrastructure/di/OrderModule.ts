import { Module, Provider } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { CreateOrder } from '../../application/services/CreateOrderService';
import { CustomerMongoRepositoryAdapter } from '../repository/customer/CustomerMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../repository/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';
import {
  CreateOrderUseCaseProvider,
  CustomerRepositoryProvider,
  OrderRepositoryProvider,
} from './OrderDiTokens';

const persistenceProviders: Provider[] = [
  {
    provide: OrderRepositoryProvider,
    useClass: OrderMongoRepositoryAdapter,
  },
  {
    provide: CustomerRepositoryProvider,
    useClass: CustomerMongoRepositoryAdapter,
  },
];

const useCaseProviders: Provider[] = [
  {
    provide: CreateOrderUseCaseProvider,
    useFactory: (customerRepository, orderRepository) =>
      new CreateOrder(customerRepository, orderRepository, 'a' as any),
    inject: [CustomerRepositoryProvider, OrderRepositoryProvider],
  },
];

@Module({
  imports: [MongoModule.forFeature(['orders', 'customers'])],
  controllers: [OrderController],
  providers: [...persistenceProviders, ...useCaseProviders],
})
export class OrderModule {}
