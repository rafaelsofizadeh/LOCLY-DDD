import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { Exception } from '../common/error-handling';
export declare class CustomExceptionFilter implements ExceptionFilter {
    catch(exception: Exception, host: ArgumentsHost): Response<any, Record<string, any>>;
}
