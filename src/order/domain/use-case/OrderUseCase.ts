import { UseCase } from '../../../common/domain/UseCase';
import { Order } from '../entity/Order';

export interface OrderUseCase<TOrderUseCasePort>
  extends UseCase<TOrderUseCasePort, Order> {}
