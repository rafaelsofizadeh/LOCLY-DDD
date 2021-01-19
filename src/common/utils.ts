import { Nullable, Optional } from './types';

export function enumToArray(inputEnum: any): any[] {
  const middle = Math.floor(inputEnum.length / 2);
  return Object.values(inputEnum).slice(0, middle);
}

export namespace Assert {
  export function trueOrThrow(expression: boolean, exception: Error): void {
    if (!expression) {
      throw exception;
    }
  }

  export function falseOrThrow(expression: boolean, exception: Error): void {
    if (expression) {
      throw exception;
    }
  }

  export function notEmptyOrThrow<T>(
    value: Optional<Nullable<T>>,
    exception: Error,
  ): T {
    if (value === null || value === undefined) {
      throw exception;
    }

    return value as T;
  }
}
