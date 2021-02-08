import { Order } from '../../domain/entity/Order';

export abstract class OrderRepository {
  abstract addOrder(order: Order): Promise<void>;
}
