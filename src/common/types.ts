/* eslint-disable @typescript-eslint/ban-types */

import { Binary } from 'mongodb';
import { EntityProps } from './domain/Entity';

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

/**
 * MongoDB utility class - omit '_id'.
 */
export type MongoIdToEntityId<T extends { _id: Binary }> = Omit<T, '_id'> & {
  id: string;
};

export type EntityIdToStringId<T extends EntityProps> = Omit<T, 'id'> & {
  id: string;
};
