import {
  IsUUID,
  ValidationError,
  registerDecorator,
  validate,
} from 'class-validator';
import { v4 as uuid } from 'uuid';
import { Code } from '../error-handling/Code';
import { Exception } from '../error-handling/Exception';

export class UniqueEntityID {
  @IsUUID(4)
  private readonly value: string;

  constructor(value: string = uuid()) {
    this.value = value;
  }

  equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) {
      return false;
    }

    if (!(id instanceof this.constructor)) {
      return false;
    }

    return id.toValue() === this.value;
  }

  async validate(): Promise<void> {
    const details: ValidationError[] = await validate(this);

    if (details.length) {
      throw new Exception(
        Code.VALUE_OBJECT_VALIDATION_ERROR,
        undefined,
        details,
      );
    }
  }

  /**
   * Return raw value of identifier
   */
  toValue(): string {
    return this.value;
  }
}

export function IsUniqueEntityId() {
  return function({ constructor: target }: Object, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueEntityId',
      target,
      propertyName,
      options: { message: 'id should be a valid UUIDv4' },
      validator: {
        async validate(id: UniqueEntityID): Promise<boolean> {
          try {
            await id.validate();
            return true;
          } catch (details) {
            return false;
          }
        },
      },
    });
  };
}
