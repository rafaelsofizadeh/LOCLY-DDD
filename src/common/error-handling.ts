import { HttpException, HttpStatus } from '@nestjs/common';

export class Exception extends HttpException {
  public data: unknown;

  constructor(httpStatus: HttpStatus, overrideMessage?: string, data?: any) {
    const message: string = `${HttpStatus[httpStatus]} ${
      overrideMessage ? `| ${overrideMessage}` : ''
    }`;

    super(message, httpStatus);

    this.data = data;
  }
}
