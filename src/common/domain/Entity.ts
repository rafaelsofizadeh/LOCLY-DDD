import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { EntityId } from './EntityId';

export class EntityProps {
  @ValidateNested({ groups: ['existing'] })
  @Type(() => EntityId)
  @Transform(({ value: id }: { value: EntityId }) => id.value, {
    toPlainOnly: true,
  })
  id?: EntityId;
}
