import { OrderUseCase } from '../OrderUseCase';
import { CreateOrderRequest } from './CreateOrderRequest';

export abstract class CreateOrderUseCase extends OrderUseCase<
  CreateOrderRequest
> {}
