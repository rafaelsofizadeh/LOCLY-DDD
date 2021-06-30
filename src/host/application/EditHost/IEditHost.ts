import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Address, AddressValidationSchema } from '../../../common/domain';
import { Host } from '../../entity/Host';

export type EditHostPayload = Readonly<{
  currentHostProperties: Pick<
    Host,
    'id' | 'firstName' | 'lastName' | 'address'
  >;
  firstName?: string;
  lastName?: string;
  address?: Address;
}>;

export class EditHostRequest
  implements Omit<EditHostPayload, 'currentHostProperties'> {
  @IsOptional()
  @IsString()
  @Length(1, 32)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  lastName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressValidationSchema)
  address?: Address;
}

export class HostProfileValidationSchema
  implements Omit<EditHostPayload, 'currentHostProperties'> {
  @IsString()
  @Length(1, 32)
  firstName: string;

  @IsString()
  @Length(1, 32)
  lastName: string;

  @ValidateNested()
  @Type(() => AddressValidationSchema)
  address: Address;
}

export abstract class IEditHost extends UseCase<EditHostPayload, void> {}
