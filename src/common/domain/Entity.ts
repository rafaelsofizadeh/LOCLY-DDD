import { ValidationError, validate } from 'class-validator';

import { UniqueEntityID } from './UniqueEntityId';
import { Base } from './Base';
import { Exception } from '../error-handling/Exception';
import { Code } from '../error-handling/Code';

// TODO: enforce UUID everywhere
export class Entity<P> extends Base<P> {
  constructor(props: P, public readonly id = new UniqueEntityID()) {
    super(props);
  }

}
