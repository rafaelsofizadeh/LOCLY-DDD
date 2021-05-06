import { HttpStatus } from '@nestjs/common';

export class Exception {
  public readonly message: string;
  public readonly error: Error;

  constructor(
    public readonly status: HttpStatus,
    specialMessage?: string,
    public readonly data?: any,
    error: Error = new Error(),
  ) {
    this.error = Object.assign(error, {
      message: [specialMessage, error.message].filter(Boolean).join(': '),
    });
  }
}

export function throwCustomException(
  message: string,
  fnMainArgs: Record<string, any> = {},
  errorStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
) {
  const debugOutput = Object.entries(fnMainArgs)
    .map(([key, arg]) => `${key}: ${JSON.stringify(arg)}`)
    .join(', ');

  const finalMessage = `${message} ${
    debugOutput === '' ? '' : `: (${debugOutput})`
  }`;

  return (error?: Error) => {
    throw new Exception(errorStatus, finalMessage, fnMainArgs, error);
  };
}

export function expectOnlyNResults(
  n: number,
  controlledVariables: number[],
  {
    operation,
    entity,
    lessThanMessage = '',
    moreThanMessage = '',
  }: {
    operation: string;
    entity: string;
    lessThanMessage?: string;
    moreThanMessage?: string;
  },
  fnMainArgs?: Record<string, any>,
) {
  const errorMessageBeginning = `Error ${operation} ${entity} —`;
  const lessThanOneErrorMessage = `${errorMessageBeginning} less than ${n} ${entity} with given requirements – ${lessThanMessage}`;
  const moreThanOneErrorMessage = `${errorMessageBeginning} more than ${n} ${entity}s with given requirements (shouldn't be possible) – ${moreThanMessage}`;

  if (controlledVariables.some(variable => variable < n)) {
    throwCustomException(
      lessThanOneErrorMessage,
      fnMainArgs,
      HttpStatus.NOT_FOUND,
    )();
  }

  if (controlledVariables.some(variable => variable > n)) {
    throwCustomException(moreThanOneErrorMessage, fnMainArgs)();
  }
}

export function expectOnlySingleResult(
  controlledVariables: number[],
  description: { operation: string; entity: string; lessThanMessage?: string },
  fnMainArgs?: Record<string, any>,
) {
  expectOnlyNResults(1, controlledVariables, description, fnMainArgs);
}
