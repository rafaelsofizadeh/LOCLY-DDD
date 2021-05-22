import jwt from 'jsonwebtoken';
import { Token } from '../entity/Token';

export function stringToToken(
  tokenString: string | undefined | null,
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
