import { ValidationError, validate } from 'class-validator';
import { Base } from './Base';
import { Code } from '../error-handling/Code';
import { Exception } from '../error-handling/Exception';

// TODO: determine if ValueObject is needed in presense of class-validator
export class ValueObject<P> extends Base<P> {
  constructor(props: P) {
    super(props);
  }

  equals(valueObject: ValueObject<P>) {
    return JSON.stringify(this) === JSON.stringify(valueObject);
  }

  /*async validate(): Promise<ValidationError[] | void> {
           const details: ValidationError[] = await validate(this, {
             whitelist: true,
           });

           if (details.length) {
             throw new Exception(
               Code.ENTITY_VALIDATION_ERROR,
               `Validation error(s) in ${(this as object).constructor.name}`,
               details,
             );
           }
         }*/

  async validate(): Promise<ValidationError[] | void> {
    const details: ValidationError[] = await validate(this, {
      whitelist: true,
    });

    if (details.length) {
      throw new Exception(
        Code.VALUE_OBJECT_VALIDATION_ERROR,
        `Validation error(s) in ${(this as object).constructor.name}`,
        details,
      );
    }
  }
}
