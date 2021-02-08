import { UseCase } from '../../../common/domain/UseCase';
import { Order } from '../entity/Order';

export abstract class OrderUseCase<TOrderUseCasePort> extends UseCase<
  TOrderUseCasePort,
  Order
> {}
