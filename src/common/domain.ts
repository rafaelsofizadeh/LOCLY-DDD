import {
  isUUID as isUUIDValidator,
  IsUUID as IsUUIDDecorator,
  IsISO31661Alpha3,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { Country } from '../order/entity/Country';

export type WithoutId<T> = Omit<T, 'id'>;

export type Modify<T, R> = Omit<T, keyof R> & R;

export type UUID = string;

export const UUID = (id?: UUID) => (id || uuidv4()) as UUID;

export const IsUUID = () => IsUUIDDecorator(4);

export const isUUID = (input: unknown): input is UUID =>
  isUUIDValidator(input, 4);

export type Email = string;

export type Address = Readonly<{
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  administrativeArea?: string;
  country: Country;
  postalCode?: string;
}>;

export class AddressValidationSchema implements Address {
  @IsString()
  @Length(1, 256)
  readonly addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  readonly addressLine2?: string;

  @IsString()
  @Length(1, 256)
  readonly locality: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  readonly administrativeArea?: string;

  @IsISO31661Alpha3()
  readonly country: Country;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  readonly postalCode: string;
}
