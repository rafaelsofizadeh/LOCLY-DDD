import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Exception } from '../../../../common/error-handling';

@Catch(Exception)
export class CustomExceptionFilter implements ExceptionFilter {
  catch({ error, status, data }: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.error(error);

    return response.status(status).json({
      message: `${HttpStatus[status]} | ${error.message}`,
      data,
    });
  }
}
