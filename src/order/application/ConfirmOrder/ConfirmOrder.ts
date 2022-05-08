import Stripe from 'stripe';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import mainConfig from '../../../../app.configuration';
import appConfig from '../../../../app.configuration';

import { ConfirmOrderResult, IConfirmOrder } from './IConfirmOrder';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { Host } from '../../../host/entity/Host';
import { UUID } from '../../../common/domain';
import { ClientSession } from 'mongodb';
import {
  StripeCheckoutSession,
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { OrderStatus, DraftedOrder } from '../../entity/Order';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { throwCustomException } from '../../../common/error-handling';
import { FeeType } from '../StripeCheckoutWebhook/IStripeCheckoutWebhook';
import { ConfirmOrderPayload } from './IConfirmOrder';
import { Customer } from '../../../customer/entity/Customer';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';

export type Match = {
  orderId: UUID;
  hostId: UUID;
};

@Injectable()
export class ConfirmOrder implements IConfirmOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly hostRepository: IHostRepository,
    private readonly customerRepository: ICustomerRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  @Transaction
  async execute({
    port: confirmOrderPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<ConfirmOrderPayload>): Promise<ConfirmOrderResult> {
    const checkoutSession: Stripe.Checkout.Session = await this.matchOrderAndCheckout(
      confirmOrderPayload,
      mongoTransactionSession,
    );

    return {
      checkoutUrl: checkoutSession.url,
    };
  }

  private async matchOrderAndCheckout(
    { orderId, customerId, balanceDiscountUsdCents }: ConfirmOrderPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const draftOrder = (await this.orderRepository.findOrder(
      { orderId, status: OrderStatus.Drafted, customerId },
      mongoTransactionSession,
    )) as DraftedOrder;

    const host: Host = await this.findMatchingHost(
      draftOrder,
      mongoTransactionSession,
    );

    const {
      stripeCustomerId,
      refereeCustomerId,
    }: Customer = await this.customerRepository.findCustomer({ customerId });

    const checkoutSession: StripeCheckoutSession = await this.createStripeCheckoutSession(
      {
        customerId,
        orderId,
        host,
        stripeCustomerId,
        balanceDiscountUsdCents,
        refereeCustomerId,
      },
      mongoTransactionSession,
    );

    return checkoutSession;
  }

  private async findMatchingHost(
    { originCountry }: DraftedOrder,
    mongoTransactionSession: ClientSession,
  ): Promise<Host> {
    try {
      return this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
        originCountry,
        mongoTransactionSession,
      );
    } catch (error) {
      console.error(error);

      throwCustomException(
        'No available host',
        { originCountry },
        HttpStatus.SERVICE_UNAVAILABLE,
      )();
    }
  }

  // TODO: Error handling and rejection events
  private async createStripeCheckoutSession(
    {
      customerId,
      orderId,
      host,
      stripeCustomerId,
      balanceDiscountUsdCents,
      refereeCustomerId,
    }: {
      customerId: Customer['id'];
      orderId: DraftedOrder['id'];
      host: Host;
      stripeCustomerId: Stripe.Customer['id'];
      balanceDiscountUsdCents: number;
      refereeCustomerId: Customer['id'];
    },
    mongoTransactionSession: ClientSession,
  ): Promise<StripeCheckoutSession> {
    if (
      !(await this.verifyBalanceAndDiscount(
        customerId,
        balanceDiscountUsdCents,
        mongoTransactionSession,
      ))
    ) {
      return throwCustomException(
        `Not enough balance to apply discount ${balanceDiscountUsdCents /
          100} USD`,
        { customerId, balanceDiscountUsdCents },
      )();
    }

    const {
      stripeProductId: serviceFeeProductId,
      stripePriceId: serviceFeePriceId,
      loclyCutPercent,
    } = appConfig.serviceFee;

    const percentage = 0.01 * loclyCutPercent;

    const {
      unit_amount: serviceFeeAmount,
      currency,
    } = await this.stripe.prices.retrieve(serviceFeePriceId);
    const loclyFeeAmount = serviceFeeAmount * percentage;

    const match: Match = {
      orderId,
      hostId: host.id,
    };

    let loclyFeeConfig: Stripe.Checkout.SessionCreateParams['payment_intent_data'];

    if (loclyFeeAmount > balanceDiscountUsdCents) {
      loclyFeeConfig = {
        application_fee_amount: loclyFeeAmount - balanceDiscountUsdCents,
        transfer_data: { destination: host.stripeAccountId },
      };
      // Minimum Stripe processable amount: $0.5
      // TODO: Put into config
    } else if (serviceFeeAmount - balanceDiscountUsdCents < 50) {
      balanceDiscountUsdCents = serviceFeeAmount - 50;
    }

    const checkoutSession = (await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            product: serviceFeeProductId,
            unit_amount: serviceFeeAmount - balanceDiscountUsdCents,
            currency,
          },
          quantity: 1,
        },
      ],
      ...(loclyFeeConfig && { payment_intent_data: loclyFeeConfig }),
      // Can't accept promo codes if customer requests discount via balance
      allow_promotion_codes: !Boolean(balanceDiscountUsdCents),
      metadata: {
        feeType: FeeType.Service,
        ...(balanceDiscountUsdCents && {
          customerId,
          balanceDiscountUsdCents,
        }),
        refereeCustomerId,
        ...match,
      },
      mode: 'payment',
      success_url: mainConfig.stripe.successPageUrl,
      cancel_url: mainConfig.stripe.cancelPageUrl,
    })) as Stripe.Response<StripeCheckoutSession>;

    return checkoutSession;
  }

  private async verifyBalanceAndDiscount(
    customerId: Customer['id'],
    balanceDiscountUsdCents: number,
    mongoTransactionSession: ClientSession,
  ): Promise<boolean> {
    const {
      balanceUsdCents,
    }: Customer = await this.customerRepository.findCustomer(
      { customerId },
      mongoTransactionSession,
      true,
    );

    return balanceUsdCents >= balanceDiscountUsdCents;
  }
}
