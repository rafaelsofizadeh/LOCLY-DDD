import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import { Code } from '../../../common/error-handling/Code';
import { Order } from '../../domain/entity/Order';
import { Exception } from '../../../common/error-handling/Exception';

import {
  ConfirmOrderRequest,
  ConfirmOrderUseCase,
} from '../../domain/use-case/ConfirmOrderUseCase';
import { HostMatcher } from '../port/HostMatcher';
import { OrderRepository } from '../port/OrderRepository';
import { Host } from '../../domain/entity/Host';
import { MatchCache } from '../port/MatchCache';
import { EntityId } from '../../../common/domain/EntityId';

export type MatchReference = Stripe.Checkout.Session['client_reference_id'];

@Injectable()
export class ConfirmOrder implements ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly hostMatcher: HostMatcher,
    // TODO: More general EventEmitter class, wrapper around eventEmitter
    private readonly eventEmitter: EventEmitter2,
    @InjectStripeClient() private readonly stripe: Stripe,
    private readonly matchRecorder: MatchCache,
  ) {}

  async execute({ orderId }: ConfirmOrderRequest) {
    const order: Order = await this.orderRepository.findOrder(orderId);

    const isServiceAvailable: boolean = await this.hostMatcher.checkServiceAvailability(
      order.originCountry,
      order.destination.country,
    );

    // TODO: Does this belong in the use case or in MatchHostService?
    if (!isServiceAvailable) {
      // TODO: Wrapper around eventEmitter
      // TODO(?): Event emitting decorator
      this.eventEmitter.emit('order.rejected.service_availability');

      throw new Exception(
        Code.INTERNAL_ERROR,
        `Service not available in country ${order.originCountry}`,
      );
    }

    const matchedHost: Host = await this.hostMatcher
      .matchHost(order.originCountry)
      .catch(error => {
        // TODO: Wrapper around eventEmitter
        // TODO(?): Event emitting decorator
        this.eventEmitter.emit('order.rejected.host_availability');
        throw error;
      });

    /**
     * Scenarios:
     *
     * I. Match Order with Host, store hostId on Order BEFORE Payment:
     *
     * 1. Host matched to Order -> Customer didn't finalize Payment -> Customer requests Order info,
     *    sees Order.Host(Id), requests Host info -> gets Host address without Paying.
     * 2. CURRENT:  Host matched to Order -> while Customer finalizes Payment, Host decides to set their status to
     *    "unavailable" -> Customer payed, but Order couldn't be matched to/executed by Host
     *    TODO: Potential solution: prohibit Host from setting status as "unavailable" while the Host has unfinalized
     *    Orders. I.e. "book" the host while the payment is being processed.
     *
     * II. Payment BEFORE matching Host:
     *
     * 1. Customer pays Order -> Order tries to match with a Host -> no Host available
     */
    const matchId = new EntityId();

    const checkoutSession: Stripe.Checkout.Session = await this.stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              // TODO: Make the service fee a method
              currency: 'usd',
              unit_amount: 10000, // cents
              product_data: {
                name: 'Locly and Host Service Fee',
              },
            },
            quantity: 1,
          },
        ],
        // ! IMPORTANT !
        client_reference_id: matchId.value,
        mode: 'payment',
        success_url: 'https://news.ycombinator.com',
        cancel_url: 'https://reddit.com',
      },
    );

    await this.matchRecorder.recordMatch({
      id: matchId,
      orderId: order.id,
      hostId: matchedHost.id,
    });

    // TODO: Wrapper around eventEmitter
    // TODO(?): Event emitting decorator
    this.eventEmitter.emit('order.awaiting_payment');

    return {
      checkoutId: checkoutSession.id,
    };
  }
}
