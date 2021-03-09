import { v4 as uuidv4 } from 'uuid';
import { IsUUID } from 'class-validator';

import { Validatable } from './Validatable';

// TODO: Use this everywhere
export type UUID = string;

class Id {
  @IsUUID(4)
  readonly value: UUID;

  constructor(id: UUID = uuidv4()) {
    this.value = id;
  }

  toString() {
    return this.value;
  }
}

export const EntityId = Validatable(Id);
export type EntityId = { value: UUID };
