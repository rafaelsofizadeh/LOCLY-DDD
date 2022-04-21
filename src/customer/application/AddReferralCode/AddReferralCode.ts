import { ClientSession } from 'mongodb';
import { HttpStatus, Injectable } from '@nestjs/common';

import appConfig from '../../../../app.configuration';

import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import { Customer } from '../../../customer/entity/Customer';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

import { AddReferralCodePayload, IAddReferralCode } from './IAddReferralCode';

@Injectable()
export class AddReferralCode extends IAddReferralCode {
  constructor(private readonly customerRepository: ICustomerRepository) {
    super();
  }

  @Transaction
  async execute({
    port: addReferralCodePayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<AddReferralCodePayload>) {
    await this.addReferralCode(addReferralCodePayload, mongoTransactionSession);
  }

  private async addReferralCode(
    { customerId, refereeCode }: AddReferralCodePayload,
    mongoTransactionSession: ClientSession,
  ) {
    if (!refereeCode) {
      return;
    }

    const {
      refereeCustomerId: existingRefereeId,
      orderIds,
      referralCode,
    }: Customer = await this.customerRepository.findCustomer(
      { customerId },
      mongoTransactionSession,
      true,
    );

    if (referralCode === refereeCode) {
      return throwCustomException(
        "Can't refer yourself",
        {
          customerId,
          refereeCode,
          referralCode,
        },
        HttpStatus.FORBIDDEN,
      )();
    }

    if (existingRefereeId) {
      return throwCustomException(
        'Customer has already been referred',
        {
          customerId,
          existingRefereeId,
        },
        HttpStatus.FORBIDDEN,
      )();
    }

    if (orderIds.length) {
      return throwCustomException(
        'Only first-time customers can be referred',
        {
          customerId,
        },
        HttpStatus.FORBIDDEN,
      )();
    }

    const {
      id: refereeCustomerId,
    }: Customer = await this.customerRepository.findCustomer(
      { referralCode: refereeCode },
      mongoTransactionSession,
    );

    await this.customerRepository.setProperties(
      { customerId },
      { refereeCustomerId },
      mongoTransactionSession,
    );

    const refereeRewardUsdCents: number =
      Number(appConfig.rewards.refereeUsd) * 100;

    await this.customerRepository.updateBalance(
      { customerId },
      refereeRewardUsdCents,
      mongoTransactionSession,
    );
  }
}
