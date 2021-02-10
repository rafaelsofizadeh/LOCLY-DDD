import { OrderUseCase } from '../OrderUseCase';
import { ConfirmOrderRequest } from './ConfirmOrderRequest';

export abstract class ConfirmOrderUseCase extends OrderUseCase<
  ConfirmOrderRequest
> {}
