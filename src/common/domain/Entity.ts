import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TransformEntityIdToString } from '../utils';

import { EntityId } from './EntityId';

export class EntityProps {
  @ValidateNested({ groups: ['existing'] })
  @Type(() => EntityId)
  @TransformEntityIdToString()
  id?: EntityId;
}
