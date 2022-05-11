import { HttpStatus } from '@nestjs/common';
export declare class Exception {
    readonly status: HttpStatus;
    readonly data?: object;
    readonly message: string;
    readonly error: Error;
    constructor(status: HttpStatus, specialMessage?: string, data?: object, error?: Error);
}
export declare function createCustomException(message: string, fnMainArgs?: Record<string, any>, errorStatus?: HttpStatus, error?: Error): Exception;
export declare function throwCustomException(message: string, fnMainArgs?: Record<string, any>, errorStatus?: HttpStatus): (error?: Error) => never;
export declare function expectOnlyNResults(n: number, controlledVariables: number[], { operation, entity, lessThanMessage, moreThanMessage, }: {
    operation: string;
    entity: string;
    lessThanMessage?: string;
    moreThanMessage?: string;
}, fnMainArgs?: Record<string, any>): void;
export declare function expectOnlySingleResult(controlledVariables: number[], description: {
    operation: string;
    entity: string;
    lessThanMessage?: string;
}, fnMainArgs?: Record<string, any>): void;
