import { Match } from '../PreConfirmOrder/PreConfirmOrderService';
import { Address } from '../../entity/Order';
import { UseCase } from '../../../common/application';

export interface ConfirmOrderRequest extends Match {}

export interface ConfirmOrderResult {
  address: Address;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  ConfirmOrderRequest,
  ConfirmOrderResult
> {}
