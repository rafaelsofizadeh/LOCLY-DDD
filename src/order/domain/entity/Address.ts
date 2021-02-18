import { IsISO31661Alpha3 } from 'class-validator';

import { StructurallyComparable } from '../../../common/domain/StructurallyComparable';
import { Validatable } from '../../../common/domain/Validatable';

export class AddressProps {
  @IsISO31661Alpha3()
  country: string;
}

export class Address extends StructurallyComparable(Validatable(AddressProps)) {
  constructor({ country }: AddressProps) {
    super();

    this.country = country;
  }
}
