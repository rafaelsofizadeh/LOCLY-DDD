import { Match } from '../../../ConfirmOrder/ConfirmOrder';
import { Address } from '../../../../entity/Order';
import { UseCase } from '../../../../../common/application';

export interface ConfirmOrderHandlerRequest extends Match {}

export interface ConfirmOrderHandlerResult {
  address: Address;
}

export abstract class IConfirmOrderHandler extends UseCase<
  ConfirmOrderHandlerRequest,
  ConfirmOrderHandlerResult
> {}
