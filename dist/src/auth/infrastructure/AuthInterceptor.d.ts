import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { IHostRepository } from '../../host/persistence/IHostRepository';
export declare class CookieAuthInterceptor implements NestInterceptor {
    private readonly hostRepository;
    constructor(hostRepository: IHostRepository);
    private getCookies;
    private tokenToIdentity;
    intercept(context: ExecutionContext, next: CallHandler): Promise<import("rxjs").Observable<any>>;
}
