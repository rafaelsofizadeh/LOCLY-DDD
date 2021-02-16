import { classToPlain } from 'class-transformer';

/**
 * TODO: https://github.com/microsoft/TypeScript/issues/14400
 * There's no way to provide only <TPropsPlain>, you'll have to provide <C>, too. So you have to always write:
 * class SomeClass extends Serializable<SomeClassPropsPlain, typeof SomeClassProps>(SomeClassProps) { ... }
 *                                                           ^^^^^^^^^^^^^^^^^^^^^
 * Also, Serializable should always be the mixin closest to the base class. Otherwise, when specifying <C>,
 * you'll have to include the typeof SomeClassProps + typeof of all the mixins applied previously.
 *
 * Example:
 *
 * class SC extends Validatable(Serializable<SCPropsPlain, typeof SCProps>(SCProps)) { ... }
 *
 * vs.
 *
 * class SC extends Serializable<SCPropsPlain, typeof Validatable & SCProps>Validatable(SCProps)) { ... }
 *                                                    ^^^^^^^^^^^^^^
 */
export function Serializable<TPropsPlain, C extends new (...args: any[]) => {}>(
  Base: C,
) {
  return class Serializable extends Base {
    serialize(): TPropsPlain {
      return classToPlain(this) as TPropsPlain;
    }
  };
}
