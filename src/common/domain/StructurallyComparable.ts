export function StructurallyComparable<C extends new (...args: any[]) => {}>(
  Base: C,
) {
  return class StructurallyComparable extends Base {
    equals(valueObject: {}) {
      return JSON.stringify(this) === JSON.stringify(valueObject);
    }
  };
}
