import { Match } from '../../../ConfirmOrder/ConfirmOrder';
import { Address } from '../../../../entity/Order';
import { UseCase } from '../../../../../common/application';

export type ConfirmOrderRequest = Match;

export type ConfirmOrderResult = {
  address: Address;
};

export abstract class IConfirmOrderHandler extends UseCase<
  ConfirmOrderRequest,
  ConfirmOrderResult
> {}
