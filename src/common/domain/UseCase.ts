import { ClientSession } from 'mongodb';

export abstract class UseCase<TUseCasePort, TUseCaseResult> {
  // TODO: abstract signature doesn't affect type checker anywhere else
  abstract execute(
    port: TUseCasePort,
    session?: ClientSession,
  ): Promise<TUseCaseResult>;
}
