import { Request, Response, NextFunction } from 'express';
export declare class VerificationTokenParamToBodyMiddleware {
    use(request: Request, response: Response, next: NextFunction): void;
}
