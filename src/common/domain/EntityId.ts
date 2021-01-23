import { v4 as uuidv4 } from 'uuid';
import { IsUUID } from 'class-validator';

import { Validatable } from './Validatable';

export type UUID = string;

class Id {
  @IsUUID(4)
  readonly value: UUID;

  constructor(id?: UUID) {
    this.value = id || uuidv4();
  }
}

export const EntityId = Validatable(Id);
export type EntityId = { value: UUID };
