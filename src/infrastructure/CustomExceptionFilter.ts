import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Exception } from '../common/error-handling';

@Catch(Exception)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // TODO: Errors during Stripe webhooks change the ctx.response to the webhook.
    // Hence, the request doesn't behave like a normal request would.
    // TODO: Webhook error handling
    const response = ctx.getResponse<Response>();
    console.error(exception?.error || 'Undefined error');

    return response?.status(exception?.status).json({
      message: `${HttpStatus[exception?.status]} | ${exception?.error.message}`,
      data: exception?.data,
    });
  }
}
