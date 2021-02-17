import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Address, AddressProps } from './Address';
import { EntityProps } from '../../../common/domain/Entity';
import { Transform, Type } from 'class-transformer';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdToStringId } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';

export class HostProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  available: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => EntityId)
  @Transform(
    ({ value: ids }: { value: EntityId[] }) => ids.map(id => id.value),
    {
      toPlainOnly: true,
    },
  )
  orderIds: EntityId[];
}

export type HostPropsPlain = Omit<
  EntityIdToStringId<Required<HostProps>>,
  'address' | 'orderIds'
> & { address: AddressProps; orderIds: string[] };

export class Host extends Identifiable(
  Serializable<HostPropsPlain, typeof HostProps>(HostProps),
) {
  constructor(
    {
      id = new EntityId(),
      address,
      orderIds,
      available,
    }: HostProps = new HostProps(),
  ) {
    super();

    this.id = id;
    this.address = address;
    this.orderIds = orderIds;
    this.available = available;
  }
}
