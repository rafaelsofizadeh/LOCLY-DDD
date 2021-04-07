import { IsPositive, IsInt } from 'class-validator';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';

export type Gram = number;

export type PackagePhysicalCharacteristics = {
  width: number;
  length: number;
  height: number;
  weight: Gram;
};

// TODO: Remove width-length-height
export class PhysicalItemProps extends EntityProps {
  @IsInt()
  @IsPositive()
  weight: Gram;

  @IsInt()
  @IsPositive()
  width: number;

  @IsInt()
  @IsPositive()
  length: number;

  @IsInt()
  @IsPositive()
  height: number;
}

export type PhysicalItemPropsPlain = EntityIdsToStringIds<PhysicalItemProps>;

export class PhysicalItem extends PhysicalItemProps {
  constructor(
    {
      id = new EntityId(),
      weight,
      width,
      length,
      height,
    }: PhysicalItemProps = new PhysicalItemProps(), // default value is needed for class-validator plainToClass. Refer to: Order.ts
  ) {
    super();

    this.id = id;
    this.weight = weight;
    this.width = width;
    this.length = length;
    this.height = height;
  }

  get physicalCharacteristics(): PackagePhysicalCharacteristics {
    return {
      width: this.width,
      length: this.length,
      height: this.height,
      weight: this.weight,
    };
  }

  serialize(): PhysicalItemPropsPlain {
    return {
      id: this.id.value,
      weight: this.weight,
      width: this.width,
      length: this.length,
      height: this.height,
    };
  }
}
