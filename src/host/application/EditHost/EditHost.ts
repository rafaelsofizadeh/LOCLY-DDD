import { Injectable } from '@nestjs/common';
import { isNotEmptyObject } from 'class-validator';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { Host } from '../../entity/Host';
import { IHostRepository } from '../../persistence/IHostRepository';
import { EditHostPayload, IEditHost } from './IEditHost';

@Injectable()
export class EditHost implements IEditHost {
  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    editHostPayload: EditHostPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.editHost(editHostPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async editHost(
    { host, ...editProperties }: EditHostPayload,
    sessionWithTransaction: ClientSession,
  ) {
    const { firstName, lastName, address }: Host = {
      ...host,
      ...editProperties,
    };

    const firstNameDefined = typeof firstName === 'string' && firstName.length;
    const lastNameDefined = typeof lastName === 'string' && lastName.length;
    const addressDefined =
      typeof address === 'object' && isNotEmptyObject(address);

    const profileComplete = [
      firstNameDefined,
      lastNameDefined,
      addressDefined,
    ].every(propDefined => propDefined);

    return this.hostRepository.setProperties(
      { hostId: host.id },
      { ...editProperties, profileComplete },
      sessionWithTransaction,
    );
  }
}
