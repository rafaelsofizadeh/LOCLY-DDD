import { IsPositive, IsInt } from 'class-validator';
import { IsUUID, UUID } from '../../../common/domain/UUID';

export type Gram = number;

export type PackagePhysicalCharacteristics = {
  width: number;
  length: number;
  height: number;
  weight: Gram;
};

// TODO: Remove width-length-height
export class PhysicalItemProps {
  @IsUUID()
  id: UUID;

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

export type PhysicalItemPropsPlain = PhysicalItemProps;

export class PhysicalItem extends PhysicalItemProps {
  constructor(
    {
      id = UUID(),
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
      id: this.id,
      weight: this.weight,
      width: this.width,
      length: this.length,
      height: this.height,
    };
  }
}
