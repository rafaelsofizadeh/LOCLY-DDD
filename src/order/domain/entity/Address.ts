import { IsISO31661Alpha3 } from 'class-validator';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { Identifiable } from '../../../common/domain/Identifiable';
import { Validatable } from '../../../common/domain/Validatable';

export class AddressProps extends EntityProps {
  @IsISO31661Alpha3()
  country: string;
}

export class Address extends Identifiable(Validatable(AddressProps)) {
  constructor(
    { id = new EntityId(), country }: AddressProps = new AddressProps(),
  ) {
    super();

    this.id = id;
    this.country = country;
  }
}
