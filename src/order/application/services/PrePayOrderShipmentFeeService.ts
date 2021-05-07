import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import {
  PrePayOrderShipmentFeeRequest,
  StripeCheckoutSessionResult,
  PrePayOrderShipmentFeeUseCase,
} from '../../domain/use-case/PrePayOrderShipmentFeeUseCase';
import { OrderRepository } from '../port/OrderRepository';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { stripePrice, withTransaction } from '../../../common/application';
import { OrderStatus } from '../../domain/entity/Order';
import { StripeCheckoutSession, StripePrice } from './PreConfirmOrderService';

@Injectable()
export class PrePayOrderShipmentFeeService
  implements PrePayOrderShipmentFeeUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    payOrderShipmentFeeRequest: PrePayOrderShipmentFeeRequest,
    session?: ClientSession,
  ): Promise<StripeCheckoutSessionResult> {
    const checkoutSession: Stripe.Checkout.Session = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.createPaymentSession(
          payOrderShipmentFeeRequest,
          sessionWithTransaction,
        ),
      this.mongoClient,
      session,
    );

    return {
      checkoutId: checkoutSession.id,
    };
  }

  // TODO: Error handling and rejection events
  private async createPaymentSession(
    { orderId, customerId }: PrePayOrderShipmentFeeRequest,
    session: ClientSession,
  ): Promise<StripeCheckoutSession> {
    const { finalShipmentCost } = await this.orderRepository.findOrder(
      { orderId, status: OrderStatus.Finalized, customerId },
      session,
    );

    const price: StripePrice = stripePrice(finalShipmentCost);

    const checkoutSession: StripeCheckoutSession = await this.stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        customer_email: 'rafa.sofizadeh@gmail.com',
        line_items: [
          {
            price_data: {
              ...price,
              product_data: {
                name: 'Order Shipment Fee',
              },
            },
            quantity: 1,
          },
        ],
        metadata: { orderId },
        mode: 'payment',
        success_url: 'https://news.ycombinator.com',
        cancel_url: 'https://reddit.com',
      },
    );

    return checkoutSession;
  }
}
