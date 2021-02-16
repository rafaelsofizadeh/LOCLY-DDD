import { IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdToStringId } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';

import { Address, AddressProps } from './Address';

export class HostProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  available: boolean;
}

export type HostPropsPlain = Omit<
  EntityIdToStringId<Required<HostProps>>,
  'address'
> & { address: AddressProps };

export class Host extends Identifiable(
  Serializable<HostPropsPlain, typeof HostProps>(HostProps),
) {
  constructor(
    { id = new EntityId(), address, available }: HostProps = new HostProps(),
  ) {
    super();

    this.id = id;
    this.address = address;
    this.available = available;
  }
}
