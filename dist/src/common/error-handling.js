"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectOnlySingleResult = exports.expectOnlyNResults = exports.throwCustomException = exports.createCustomException = exports.Exception = void 0;
const common_1 = require("@nestjs/common");
const util_1 = require("util");
class Exception {
    status;
    data;
    message;
    error;
    constructor(status, specialMessage, data, error = new Error()) {
        this.status = status;
        this.data = data;
        this.error = Object.assign(error, {
            message: [specialMessage, error.message].filter(Boolean).join(': '),
        });
    }
}
exports.Exception = Exception;
function CustomException(message, fnMainArgs = {}, errorStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
    const debugOutput = Object.entries(fnMainArgs)
        .map(([key, arg]) => `${key}: ${(0, util_1.inspect)(arg).replace(/\r?\n/g, '')}`)
        .join(', ');
    const finalMessage = `${message} ${debugOutput.length ? `: (${debugOutput})` : ''}`;
    return Exception.bind({}, errorStatus, finalMessage, fnMainArgs);
}
function createCustomException(message, fnMainArgs = {}, errorStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR, error) {
    const exceptionCtor = CustomException(message, fnMainArgs, errorStatus);
    return new exceptionCtor(error);
}
exports.createCustomException = createCustomException;
function throwCustomException(message, fnMainArgs = {}, errorStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
    const exceptionCtor = CustomException(message, fnMainArgs, errorStatus);
    return (error) => {
        throw new exceptionCtor(error);
    };
}
exports.throwCustomException = throwCustomException;
function expectOnlyNResults(n, controlledVariables, { operation, entity, lessThanMessage = '', moreThanMessage = '', }, fnMainArgs) {
    const errorMessageBeginning = `Error ${operation} ${entity} —`;
    const lessThanNErrorMessage = `${errorMessageBeginning} less than ${n} ${entity} with given requirements ${lessThanMessage.length ? ':' + lessThanMessage : ''}`;
    const moreThanNErrorMessage = `${errorMessageBeginning} more than ${n} ${entity}s with given requirements (shouldn't be possible) ${moreThanMessage.length ? ':' + moreThanMessage : ''}`;
    if (controlledVariables.some(variable => variable < n)) {
        throwCustomException(lessThanNErrorMessage, fnMainArgs, common_1.HttpStatus.NOT_FOUND)();
    }
    if (controlledVariables.some(variable => variable > n)) {
        throwCustomException(moreThanNErrorMessage, fnMainArgs)();
    }
}
exports.expectOnlyNResults = expectOnlyNResults;
function expectOnlySingleResult(controlledVariables, description, fnMainArgs) {
    expectOnlyNResults(1, controlledVariables, description, fnMainArgs);
}
exports.expectOnlySingleResult = expectOnlySingleResult;
//# sourceMappingURL=error-handling.js.map