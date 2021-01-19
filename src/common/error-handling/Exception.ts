import { Code, CodeDescription } from './Code';
import { Optional } from '../types';

export class Exception<TData> extends Error {
  public code: number;
  public readonly data: Optional<TData>;

  constructor(
    codeDescription: CodeDescription = Code.INTERNAL_ERROR,
    overrideMessage?: string,
    data?: TData,
  ) {
    super();

    this.name = this.constructor.name;
    this.code = codeDescription.code;
    this.data = data;
    this.message = (overrideMessage || codeDescription.message).concat(
      '\n',
      JSON.stringify(this.data, null, 2),
    );

    Error.captureStackTrace(this, this.constructor);
  }
}
