import { Code, CodeDescription } from './Code';

// TODO: Inherit from HttpException or do error mapping for Nest.js to display the exception properly
export class Exception<TData> extends Error {
  public code: number;
  public readonly data?: TData;

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
