export abstract class IAuthDeliveryStrategy {
  abstract deliverAuth(
    authTokenString: string,
    deliveryAddress?: string,
  ): Promise<any>;
}
