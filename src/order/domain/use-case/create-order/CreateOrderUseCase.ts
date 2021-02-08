import { OrderUseCase } from '../OrderUseCase';
import { CreateOrderRequestPort } from './CreateOrderRequestPort';

export abstract class CreateOrderUseCase extends OrderUseCase<
  CreateOrderRequest
> {}
