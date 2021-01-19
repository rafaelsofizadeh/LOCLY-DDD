/* eslint-disable @typescript-eslint/ban-types */

/**
 * 'undefinable' type.
 */
export type Optional<T> = T | undefined;

/**
 * 'nullable' type
 */
export type Nullable<T> = T | null;

/**
 * Callable function type.
 */
export type Fn<T = any> = (...args: any[]) => T;

/**
 * Class type, allowing only classes with a constructor (non-abstract).
 */
export type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Mixin class type.
 */
export type Mixin<T extends Fn> = InstanceType<ReturnType<T>>;
