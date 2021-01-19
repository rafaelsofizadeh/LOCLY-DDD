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

  equals(entity: Entity<P>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id === entity.id;
  }

  async validate(): Promise<ValidationError[] | void> {
    console.log(`Validate ${(this as object).constructor.name}`, this);
    const details: ValidationError[] = await validate(this);
    console.log('details', details);

    if (details.length) {
      throw new Exception(
        Code.ENTITY_VALIDATION_ERROR,
        `Validation error(s) in ${(this as object).constructor.name}`,
        details,
      );
    }
  }

  /*async validate(): Promise<void> {
           try {
             await super.validate.call(this);
           } catch (exception) {
             const typedException = exception as Exception<ValidationError[]>;
             throw new Exception(
               Code.ENTITY_VALIDATION_ERROR,
               `Validation error(s) in ${(this as object).constructor.name}`,
               typedException.data,
             );
           }*/
}
