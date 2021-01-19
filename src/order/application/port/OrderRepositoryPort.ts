import { Order } from '../../domain/entity/Order';

export interface OrderRepositoryPort {
  addOrder(order: Order): Promise<void>;
}
