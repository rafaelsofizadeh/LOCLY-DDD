import { Injectable } from '@nestjs/common';
import { IAuthDeliveryStrategy } from './IAuthDeliveryStrategy';

type AuthVerificationToken = string;
type OutputAuthDeliveryResult = AuthVerificationToken;

@Injectable()
export class OutputAuthDeliveryStrategy implements IAuthDeliveryStrategy {
  async deliverAuth(
    authTokenString: string,
  ): Promise<OutputAuthDeliveryResult> {
    return authTokenString;
  }
}
