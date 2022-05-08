import { Injectable } from '@nestjs/common';

import config from '../../../../app.configuration';

import { Token } from '../../entity/Token';
import { tokenToString } from '../utils';
import { IVerifyAuth } from './IVerifyAuth';

/**
 * Functionality for the second and last step in user auth – handle the user going through the auth verification URL
 * (from user's email), decrypt the verification token, convert to auth token.
 */
@Injectable()
export class VerifyAuth implements IVerifyAuth {
  execute(verificationToken: Token): string {
    return this.verificationTokenToAuthToken(verificationToken);
  }

  /**
   * The token gets decoded/decrypted. Token payload is extracted; isVerification is set to from true to false.
   * Validation token expiration dates are set to very short periods (~30 mins, see above, "JWT"), so, to convert to
   * the verification token to an auth/session token, expiration set is updated with a much longer period.
   */
  private verificationTokenToAuthToken({ id, type }: Token): string {
    const {
      tokenKey,
      verificationTokenExpiration,
      authTokenExpiration,
    } = config.auth;

    return tokenToString(
      { id, type, isVerification: false },
      tokenKey,
      authTokenExpiration,
    );
  }
}
