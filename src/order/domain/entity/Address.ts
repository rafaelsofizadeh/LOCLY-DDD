import { IsISO31661Alpha3 } from 'class-validator';
import { Country } from '../data/Country';

export class AddressProps {
  @IsISO31661Alpha3()
  country: Country;
}

export type AddressPropsPlain = AddressProps;

export class Address extends AddressProps {
  // default value is needed for class-validator plainToClass
  constructor({ country }: AddressProps = new AddressProps()) {
    super();

    this.country = country;
  }

  serialize(): AddressPropsPlain {
    return {
      country: this.country,
    };
  }
}
