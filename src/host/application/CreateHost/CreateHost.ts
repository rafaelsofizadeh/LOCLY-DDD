import Stripe from 'stripe';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { alpha3ToAlpha2 } from 'i18n-iso-countries';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';
import { CreateHostPayload, ICreateHost } from './ICreateHost';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Country } from '../../../order/entity/Country';
import { throwCustomException } from '../../../common/error-handling';

@Injectable()
export class CreateHost implements ICreateHost {
  // Important for the host to be available for cross-border payouts.
  // https://stripe.com/docs/connect/cross-border-payouts
  private readonly stripeSupportedCountries: Country[] = [
    'ARG',
    'AUS',
    'AUT',
    'BEL',
    'BOL',
    'BGR',
    'CAN',
    'CHL',
    'COL',
    'CRI',
    'HRV',
    'CYP',
    'CZE',
    'DNK',
    'DOM',
    'EGY',
    'EST',
    'FIN',
    'FRA',
    'DEU',
    'GRC',
    'HKG',
    'HUN',
    'ISL',
    'IND',
    'IDN',
    'IRL',
    'ISR',
    'ITA',
    'LVA',
    'LIE',
    'LTU',
    'LUX',
    'MLT',
    'MEX',
    'NLD',
    'NZL',
    'NOR',
    'PRY',
    'PER',
    'POL',
    'PRT',
    'ROU',
    'SGP',
    'SVK',
    'SVN',
    'ESP',
    'SWE',
    'CHE',
    'THA',
    'TTO',
    'GBR',
    'URY',
  ];

  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  @Transaction
  async execute({
    port: createHostPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<CreateHostPayload>): Promise<Host> {
    return this.createHost(createHostPayload, mongoTransactionSession);
  }

  private async createHost(
    { email, country }: CreateHostPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<Host> {
    if (!this.stripeSupportedCountries.includes(country)) {
      throwCustomException(
        `Host can't be based in ${country}. Stripe doesn't support cross-border payouts in ${country}. https://stripe.com/docs/connect/cross-border-payouts`,
        { country },
      )();
    }

    const hostAccount: Stripe.Account = await this.stripe.accounts.create({
      type: 'express',
      email,
      country: alpha3ToAlpha2(country),
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      // TODO: Do this through Stripe dashboard
      // https://stripe.com/docs/connect/service-agreement-types#choosing-type-with-express
      // https://dashboard.stripe.com/settings/connect/express
      tos_acceptance: {
        service_agreement: 'recipient',
      },
      settings: {
        payouts: {
          schedule: {
            delay_days: 10,
            interval: 'daily',
          },
        },
      },
    });

    const host: Host = {
      id: UUID(),
      email,
      country,
      orderIds: [],
      stripeAccountId: hostAccount.id,
      available: false,
      verified: false,
      profileComplete: false,
    };

    await this.hostRepository.addHost(host, mongoTransactionSession);

    return host;
  }
}
