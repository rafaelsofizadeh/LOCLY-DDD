import { OrderUseCase } from '../OrderUseCase';
import { CreateOrderRequestPort } from './CreateOrderRequestPort';

export interface CreateOrderUseCase
  extends OrderUseCase<CreateOrderRequestPort> {}
