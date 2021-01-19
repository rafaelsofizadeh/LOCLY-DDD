import { Allow, validate, ValidationError } from 'class-validator';
import { Exception } from '../error-handling/Exception';

// Why export default anonymous function?
// 'exported class expression may not be private or protected.'
// https://github.com/microsoft/TypeScript/issues/30355#issuecomment-671095933
/*const Base = <T>() => {
  abstract class Base {
    protected constructor(protected props: T) {}

    // 'this' trick:
    // https://github.com/microsoft/TypeScript/issues/5863#issuecomment-632509391 (BETTER)
    // https://github.com/Microsoft/TypeScript/issues/5863#issuecomment-528305043 (ORIGINAL)
    static create<C extends Base>(this: new (props: T) => C, props: T): C {
      return new this(props);
    }

    static async createAndValidate<C extends Base>(
      this: new (props: T) => C,
      props: T,
    ): Promise<C> {
      const instance = new this(props);
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
  };

  return Base;
}*/

// OLD version, with a 'this' trick:
// https://github.com/microsoft/TypeScript/issues/5863#issuecomment-752874483 (BEST)
// https://github.com/microsoft/TypeScript/issues/5863#issuecomment-632509391 (BETTER)
// https://github.com/Microsoft/TypeScript/issues/5863#issuecomment-528305043 (ORIGINAL)
export abstract class Base<P> {
  // See CreateOrderRequestAdapter.ts: forbidNonWhitelisted causes an error.
  // @Allow()
  constructor(protected readonly props: P = {} as P) {}

  /*async validate(): Promise<ValidationError[] | void> {
    const details: ValidationError[] = await validate(this, {
      whitelist: true,
    });

    if (details.length) {
      throw new Exception(undefined, undefined, details);
    }
  }*/
}
