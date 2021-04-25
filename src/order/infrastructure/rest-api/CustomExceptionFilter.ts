import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { Exception } from '../../../common/error-handling';

@Catch(Exception)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    return response.status(status).json({
      statusCode: status,
      message: exception.message,
      data: exception.data,
    });
  }
}
