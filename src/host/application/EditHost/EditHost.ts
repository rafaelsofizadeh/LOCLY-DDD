import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { IHostRepository } from '../../persistence/IHostRepository';
import { EditHostPayload, IEditHost } from './IEditHost';

@Injectable()
export class EditHost implements IEditHost {
  constructor(private readonly hostRepository: IHostRepository) {}

  @Transaction
  async execute({
    port: editHostPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<EditHostPayload>): Promise<void> {
    await this.editHost(editHostPayload, mongoTransactionSession);
  }

  private async editHost(
    { currentHostProperties, ...editProperties }: EditHostPayload,
    sessionWithTransaction: ClientSession,
  ) {
    const editPropertiesOnlyDefined = Object.entries(editProperties).reduce(
      (defined, [k, v]) => {
        // https://stackoverflow.com/a/21273362/6539857 for !=
        if (v != null) defined[k] = v;
        return defined;
      },
      {},
    );

    const profile = {
      ...currentHostProperties,
      ...editPropertiesOnlyDefined,
    };

    const profileComplete = ['firstName', 'lastName', 'address'].every(
      k =>
        // https://stackoverflow.com/a/21273362/6539857 for !=
        profile[k] != null &&
        (typeof profile[k] === 'object'
          ? Object.keys(profile[k]).length !== 0
          : true),
    );

    return this.hostRepository.setProperties(
      { hostId: currentHostProperties.id },
      { ...editPropertiesOnlyDefined, profileComplete },
      sessionWithTransaction,
    );
  }
}
