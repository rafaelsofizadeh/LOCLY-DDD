import { ClientSession, MongoClient } from 'mongodb';
import { Stripe } from 'stripe';
import { Cost } from '../order/entity/Order';
import { StripeCheckoutCompletedWebhookPayload } from '../order/application/StripeCheckoutCompletedWebhook/StripeCheckoutCompletedWebhookGateway';
import { Exception } from './error-handling';

export abstract class UseCase<TUseCasePort, TUseCaseResult> {
  // TODO: abstract signature doesn't affect type checker anywhere else
  abstract execute(
    port: TUseCasePort,
    session?: ClientSession,
  ): Promise<TUseCaseResult>;
}

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  mongoClient: MongoClient,
  session?: ClientSession,
): Promise<T> {
  const wrappedFn = (session: ClientSession) =>
    abortTransactionOnNonMongoException(session, fn);
  // Session takes precendence over mongoClient
  return session === undefined
    ? await withNewSessionTransaction(mongoClient, fn)
    : await withExistingSessionTransaction(session, wrappedFn);
}

async function withExistingSessionTransaction<T>(
  session: ClientSession,
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  // Session already in transaction, program will assume it's already wrapped in session.withTransaction
  if (session.inTransaction()) {
    console.warn(
      "Session already in transaction, program will assume it's already wrapped in session.withTransaction",
    );
    return fn(session);
  }

  let result: T;
  await session.withTransaction(async () => (result = await fn(session)));
  return result;
}

async function withNewSessionTransaction<T>(
  mongoClient: MongoClient,
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  let result: T;

  await mongoClient.withSession(
    async (session: ClientSession) =>
      await session.withTransaction(
        async (sessionWithTransaction: ClientSession) =>
          (result = await fn(sessionWithTransaction)),
      ),
  );

  return result;
}

async function abortTransactionOnNonMongoException<T>(
  session: ClientSession,
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  // Test if session has a transaction initialized (to abort that transaction)
  if (!session.inTransaction()) {
    throw new Error(
      "Can't abort transaction as session isn't in transaction state",
    );
  }

  try {
    return await fn(session);
  } catch (exceptionOrMongoError) {
    if (exceptionOrMongoError instanceof Exception) {
      await session.abortTransaction();
      console.log('Transaction aborted');
    }

    throw exceptionOrMongoError;
  }
}

export function stripePrice({ currency, amount }: Cost): StripePrice {
  return {
    currency: currency,
    unit_amount: Math.floor(amount * 100),
  };
}

export type StripePrice = Pick<
  Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
  'currency' | 'unit_amount'
>;

export type StripeEvent = Omit<Stripe.Event, 'type'> & {
  type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
};

export type StripeCheckoutSession = Stripe.Checkout.Session & {
  metadata: StripeCheckoutCompletedWebhookPayload;
};
