export abstract class IVerifyAuthnCustomer {
  abstract execute(verificationToken: string): string;
}
