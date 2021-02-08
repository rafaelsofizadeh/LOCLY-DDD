export abstract class UseCase<TUseCasePort, TUseCaseResult> {
  abstract execute(port?: TUseCasePort): Promise<TUseCaseResult>;
}
