import { validate, ValidationError } from 'class-validator';
import { Code } from '../error-handling/Code';
import { Exception } from '../error-handling/Exception';

export function Validatable<Ctor extends new (...args: any[]) => {}>(
  Base: Ctor,
) {
  return class Validatable extends Base {
    async validate(): Promise<ValidationError[] | void> {
      const details: ValidationError[] = await validate(this);

      if (details.length) {
        throw new Exception(
          Code.VALIDATION_ERROR,
          `Validation error in ${Base.constructor.name} class`,
          details,
        );
      }
    }
  };
}
