import { IsISO31661Alpha3 } from 'class-validator';
import { Entity } from '../../../common/domain/Entity';

export type AddressProps = {
  country: string;
};

export class Address extends Entity<AddressProps> {
  @IsISO31661Alpha3()
  get country(): string {
    return this.props?.country;
  }
}
