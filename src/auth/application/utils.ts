import { HttpStatus } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { throwCustomException } from '../../common/error-handling';
import {
  Token,
  VerificationGrants,
  EntityTypeWithStatus,
  CustomerGrants,
  UnverifiedHostGrants,
  HostGrants,
} from '../entity/Token';

export function stringToToken(
  tokenString: string,
  key: string,
): { token?: Token; expiredAt?: number; errorMessage?: string } {
  try {
    const { exp, iat, ...token } = jwt.verify(tokenString, key) as Token & {
      exp: number;
      iat: number;
    };

    return { token };
  } catch ({ name, expiredAt, message: errorMessage }) {
    if (name === 'TokenExpiredError') {
      return { expiredAt, errorMessage };
    }

    if (name === 'JsonWebTokenError') {
      return { errorMessage };
    }
  }
}

export function tokenToString(
  token: Token,
  key: string,
  expiresIn: string,
): string {
  const tokenString: string = jwt.sign(token, key, { expiresIn });

  return tokenString;
}

// TODO(NOW): Attach grants & refresh to token body
export function completeToken(
  incompleteToken: Omit<Token, 'grants' | 'refresh'>,
): Token {
  if (incompleteToken.isVerification) {
    return { ...incompleteToken, grants: VerificationGrants, refresh: false };
  }

  if (incompleteToken.entityType in tokenEntityConstants) {
    return {
      ...incompleteToken,
      ...tokenEntityConstants[incompleteToken.entityType],
    } as Token;
  }

  throwCustomException(
    'Invalid token',
    arguments[0],
    HttpStatus.UNAUTHORIZED,
  )();
}

const tokenEntityConstants: Record<
  EntityTypeWithStatus,
  { grants: ReadonlyArray<string>; refresh: boolean }
> = {
  [EntityTypeWithStatus.Customer]: { grants: CustomerGrants, refresh: true },
  [EntityTypeWithStatus.UnverifiedHost]: {
    grants: UnverifiedHostGrants,
    refresh: true,
  },
  [EntityTypeWithStatus.Host]: { grants: HostGrants, refresh: true },
};
