import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import { IHostRepository } from '../../persistence/IHostRepository';
import {
  EditHostPayload,
  HostProfileValidationSchema,
  IEditHost,
} from './IEditHost';

// TODO: Add country editing (but only once) for those who didn't select country during registration
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
    const { firstName, lastName, address } = {
      ...currentHostProperties,
      ...editProperties,
    };

    const profile: HostProfileValidationSchema = plainToClass(
      HostProfileValidationSchema,
      { firstName, lastName, address },
    );

    const profileComplete = !validateSync(profile).length;

    return this.hostRepository.setProperties(
      { hostId: currentHostProperties.id },
      { ...editProperties, profileComplete },
      sessionWithTransaction,
    );
  }
}
