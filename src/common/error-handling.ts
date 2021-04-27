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
  const debugOutputArgs: Array<[string, any]> = Object.entries(
    fnMainArgs,
  ).filter(
    ([_, arg]: [string, any]) =>
      typeof arg === 'string' || typeof arg === 'number',
  );

  const debugOutput = debugOutputArgs
    .map(([key, arg]) => `${key}: ${arg}`)
    .join(', ');

  const finalMessage = `${message}: ${
    debugOutputArgs.length ? `(${debugOutput})` : ''
  }`;

  return (error?: Error) => {
    throw new Exception(errorStatus, finalMessage, fnMainArgs, error);
  };
}

export function expectOnlySingleResult(
  controlledVariables: number[],
  { operation, entity }: { operation: string; entity: string },
  fnMainArgs?: Record<string, any>,
) {
  const errorMessageBeginning = `Error ${operation} ${entity} — `;
  const lessThanOneErrorMessage = `${errorMessageBeginning} no ${entity} with given requirements`;
  const moreThanOneErrorMessage = `${errorMessageBeginning} more than one ${entity} with given requirements (shouldn't be possible)`;

  if (controlledVariables.some(variable => variable < 1)) {
    throwCustomException(
      lessThanOneErrorMessage,
      fnMainArgs,
      HttpStatus.NOT_FOUND,
    )();
  }

  if (controlledVariables.some(variable => variable > 1)) {
    throwCustomException(moreThanOneErrorMessage, fnMainArgs)();
  }
}
