import { Token } from '../entity/Token';
export declare function stringToToken(tokenString: string | undefined | null, key: string): {
    token?: Token;
    expiredAt?: number;
    errorMessage?: string;
};
export declare function tokenToString(token: Token, key: string, expiresIn: string): string;
