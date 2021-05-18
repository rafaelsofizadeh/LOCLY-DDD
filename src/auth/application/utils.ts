import { HttpStatus } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { throwCustomException } from '../../common/error-handling';
import {
  Token,
  VerificationGrants,
  TokenEntityType,
  CustomerGrants,
  UnverifiedHostGrants,
  HostGrants,
} from '../entity/Token';

export function stringToToken(
  tokenString: string,
  key: string,
): { token?: Token; expiredAt?: number; errorMessage?: string } {
  try {
    const token: Token = jwt.verify(tokenString, key) as Token;

    return {
      token: completeToken(token),
    };
  } catch ({ name, expiredAt, message: errorMessage }) {
    if (name === 'TokenExpiredError') {
      return {
        expiredAt,
        errorMessage,
      };
    }

    if (name === 'JsonWebTokenError') {
      return {
        errorMessage,
      };
    }
  }
}

export function completeToken(
  incompleteToken: Omit<Token, 'grants' | 'refresh'>,
): Token {
  if (incompleteToken.isVerification) {
    if (incompleteToken.forEntity in tokenEntityConstants) {
      return {
        ...incompleteToken,
        ...tokenEntityConstants[incompleteToken.forEntity],
      } as Token;
    } else {
      throwCustomException(
        'Invalid token',
        arguments[0],
        HttpStatus.UNAUTHORIZED,
      )();
    }
  } else {
    return { ...incompleteToken, grants: VerificationGrants, refresh: false };
  }
}

const tokenEntityConstants: Record<
  TokenEntityType,
  { grants: ReadonlyArray<string>; refresh: boolean }
> = {
  [TokenEntityType.Customer]: { grants: CustomerGrants, refresh: true },
  [TokenEntityType.UnverifiedHost]: {
    grants: UnverifiedHostGrants,
    refresh: true,
  },
  [TokenEntityType.Host]: { grants: HostGrants, refresh: true },
};
