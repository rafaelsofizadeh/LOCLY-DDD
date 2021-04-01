import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { EntityId } from '../../../common/domain/EntityId';
import { TransformStringToEntityId } from '../../../common/utils';
import { ReceiveOrderHostRequest } from '../../domain/use-case/ReceiveOrderByHostUseCase';

export class ReceiveOrderHostRequestAdapter implements ReceiveOrderHostRequest {
  /*
   * Nest.js first performs transformation, then validation, so, the process is like:
   * HTTP request -> customerId: "string" ->
   * class-transformer Transform() -> EntityId ->
   * class-validator Validate()
   * https://github.com/nestjs/nest/blob/fa494041c8705dc0600ddf623fb5e1e676932221/packages/common/pipes/validation.pipe.ts#L96
   */
  @ValidateNested()
  @Type(() => EntityId)
  @TransformStringToEntityId()
  readonly orderId: EntityId;
}
