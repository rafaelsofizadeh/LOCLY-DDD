import { EntityProps } from './Entity';

export function Identifiable<
  EntityCtor extends new (...args: any[]) => EntityProps
>(BaseEntity: EntityCtor) {
  return class Identifiable extends BaseEntity {
    equals(entity: EntityProps): boolean {
      if (entity === null || entity === undefined) {
        return false;
      }

      if (this === entity) {
        return true;
      }

      return this.id.value === entity.id.value;
    }
  };
}
