import { validate, ValidationError } from 'class-validator';
import { Code, Exception } from '../errorHandling';

// https://github.com/microsoft/TypeScript/issues/5863#issuecomment-632509391 (BETTER)
// https://github.com/Microsoft/TypeScript/issues/5863#issuecomment-528305043 (ORIGINAL)
export class Base {
  static create<P, C extends Base>(this: new (params: P) => C, params: P): C {
    return new this(params);
  }

  static async createAndValidate<P, C extends Base>(
    this: new (params: P) => C,
    params: P,
  ): Promise<C> {
    const instance = new this(params);
    await instance.validate();

    return instance;
  }

  async validate(): Promise<void> {
    const details: ValidationError[] = await validate(this, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (details.length) {
      throw new Exception(Code.ENTITY_VALIDATION_ERROR, undefined, details);
    }
  }
}
