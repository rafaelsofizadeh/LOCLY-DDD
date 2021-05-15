export abstract class IVerifyAuthn {
  abstract execute(verificationToken: string): string;
}
