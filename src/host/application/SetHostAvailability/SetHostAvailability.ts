import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import { IHostRepository } from '../../persistence/IHostRepository';
import {
  SetHostAvailabilityPayload,
  ISetHostAvailability,
} from './ISetHostAvailability';

@Injectable()
export class SetHostAvailability implements ISetHostAvailability {
  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    setHostAvailabilityPayload: SetHostAvailabilityPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.setHostAvailability(
          setHostAvailabilityPayload,
          sessionWithTransaction,
        ),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async setHostAvailability(
    {
      host: { id: hostId, verified, profileComplete },
      available,
    }: SetHostAvailabilityPayload,
    sessionWithTransaction: ClientSession,
  ) {
    if (available === true) {
      const canHostBeAvailable: boolean = verified && profileComplete;

      if (!canHostBeAvailable) {
        const message: string[] = [];
        const requirements: string[] = [];

        if (!verified) {
          message.push(
            'Host is not verified. Verify to be able to set your profile availability.',
          );
          requirements.push('verified');
        }

        if (!profileComplete) {
          message.push('Host profile is not complete.');
          requirements.push('profileComplete');
        }

        const finalMessage = message.join(' | ');

        throwCustomException(
          finalMessage,
          { requirements },
          HttpStatus.FORBIDDEN,
        )();
      }
    }

    return this.hostRepository.setProperties(
      { hostId },
      { available },
      sessionWithTransaction,
    );
  }
}
