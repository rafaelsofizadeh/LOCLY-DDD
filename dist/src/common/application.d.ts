import { ClientSession, MongoClient } from 'mongodb';
import { Stripe } from 'stripe';
import { Cost } from '../order/entity/Order';
import { StripeCheckoutWebhookPayload } from '../order/application/StripeCheckoutWebhook/IStripeCheckoutWebhook';
export declare type TransactionUseCasePort<P> = {
    port: P;
    mongoTransactionSession?: ClientSession;
};
export declare abstract class UseCase<TUseCasePort, TUseCaseResult> {
    abstract execute(arg: TransactionUseCasePort<TUseCasePort>): Promise<TUseCaseResult>;
}
export declare function Transaction<TUseCasePort, TUseCaseResult>(target: UseCase<TUseCasePort, TUseCaseResult>, key: string | symbol, descriptor: TypedPropertyDescriptor<(arg: {
    mongoTransactionSession?: ClientSession;
}) => Promise<any>>): TypedPropertyDescriptor<(arg: {
    mongoTransactionSession?: ClientSession;
}) => Promise<any>>;
export declare function withTransaction<T>(fn: (mongoTransactionSession: ClientSession) => Promise<T>, mongoClient: MongoClient, mongoTransactionSession?: ClientSession): Promise<T>;
export declare function stripePrice({ currency, amount }: Cost): StripePrice;
export declare function calculateStripeFee(unitAmount: number): StripePrice['unit_amount'];
export declare type StripePrice = Pick<Stripe.Checkout.SessionCreateParams.LineItem.PriceData, 'currency' | 'unit_amount'>;
export declare type StripeEvent = Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
};
export declare type StripeCheckoutSession = Stripe.Checkout.Session & {
    metadata: StripeCheckoutWebhookPayload;
};
export declare type StripeCheckoutSessionResult = {
    readonly checkoutUrl: string;
};
