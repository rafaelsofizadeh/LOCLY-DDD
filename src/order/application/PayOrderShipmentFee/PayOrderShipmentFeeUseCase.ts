import { UseCase, UUID } from '../../../common/domain';

export interface PayOrderShipmentFeeRequest {
  orderId: UUID;
}

export type PayOrderShipmentFeeResult = void;

export abstract class PayOrderShipmentFeeUseCase extends UseCase<
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeResult
> {}
