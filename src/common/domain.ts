import { ClientSession } from 'mongodb';
import {
  isUUID as isUUIDValidator,
  IsUUID as IsUUIDDecorator,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export type WithoutId<T> = Omit<T, 'id'>;

export type Modify<T, R> = Omit<T, keyof R> & R;

export abstract class UseCase<TUseCasePort, TUseCaseResult> {
  // TODO: abstract signature doesn't affect type checker anywhere else
  abstract execute(
    port: TUseCasePort,
    session?: ClientSession,
  ): Promise<TUseCaseResult>;
}

// TODO: Strict UUID type alias
export type UUID = string;

export const UUID = (id?: UUID) => (id || uuidv4()) as UUID;

export const IsUUID = () => IsUUIDDecorator(4);

export const isUUID = (input: unknown) => isUUIDValidator(input, 4);
