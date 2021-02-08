import { IsBoolean, ValidateNested } from 'class-validator';
import { Address } from './Address';
import { EntityProps } from '../../../common/domain/Entity';
import { Type } from 'class-transformer';
import { EntityId } from '../../../common/domain/EntityId';

export class HostProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  available: boolean;
}

export class Host extends HostProps {
  constructor({ id = new EntityId(), address }: HostProps = new HostProps()) {
    super();

    this.id = id;
    this.address = address;
  }
}
