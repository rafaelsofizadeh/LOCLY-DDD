import { Binary } from 'mongodb';
import { Stream } from 'stream';
import MUUID from 'uuid-mongodb';
import { OrderStatus } from '../order/entity/Order';
import { isUUID, UUID } from './domain';

function muuidToString(id: Binary): string {
  return MUUID.from(id).toString();
}

export function muuidToUuid(id: Binary): UUID {
  return UUID(muuidToString(id));
}

export function uuidToMuuid(id: UUID): Binary {
  return MUUID.from(id);
}

export type EntityFilter<T extends { id: UUID }, Id> = Partial<Omit<T, 'id' | 'status'> & {status: OrderStatus | OrderStatus[]} &
  Id>;

// https://stackoverflow.com/a/47058976/6539857
type PathsToStringProps<T> = T extends string ? [] : {
    [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>]
}[Extract<keyof T, string>];

type Join<T extends string[], D extends string> =
    T extends [] ? never :
    T extends [infer F] ? F :
    T extends [infer F, ...infer R] ?
    F extends string ?
    `${F}${D}${Join<Extract<R, string[]>, D>}` : never : string;

// https://gist.github.com/penguinboy/762197
// TODO: Typing
export function flattenObject<T extends Record<string, any>>(
  object: T,
  path?: string,
  keyFilter?: (k: string) => boolean,
  valueFilter?: (v: any) => boolean,
  separator: string = '.',
): {
  [K in keyof T as Join<PathsToStringProps<T[K]>, '.'>]: T[K] extends object ? never : T[K]
} {
  const keys: (keyof T)[] = Object.keys(object);

  return keys.reduce((flatObjectAcc: T, key: string): T => {
    if (keyFilter && !keyFilter(key)) {
      return flatObjectAcc;
    }

    const value = object[key];

    // Filter out values (e.g. undefined or null)
    if (valueFilter && valueFilter(value)) {
      return flatObjectAcc;
    }

    const newPath = [path, key].filter(Boolean).join(separator);

    const isObject = [
      typeof value === 'object',
      value !== null, // as typeof null === 'object'
      !(value instanceof Date),
      !(value instanceof RegExp),
      !(value instanceof Binary),
      !(Array.isArray(value) && value.length === 0),
    ].every(Boolean);

    return isObject
      ? {
          ...flatObjectAcc,
          ...flattenObject(value, newPath, keyFilter, valueFilter, separator),
        }
      : { ...flatObjectAcc, [newPath]: value };
  }, {} as T) as any;
}

type isUUID<S> = S extends string ? S extends 'id' | `${infer IdOfEntity}Id` ? true : false : false;

type RemovePrefix<T> = T extends `_${infer WithoutPrefix}` ? WithoutPrefix : T;
type AddPrefix<S> = S extends string ? isUUID<S> extends true ? `_${S}` : S : S;


export type SerializedMongoDocument<T> = T extends object
  ? T extends Date | Buffer | RegExp | Stream
    ? T
    : T extends Binary
    ? UUID
    : T extends Array<infer R>
    ? Array<SerializedMongoDocument<R>>
    : {
        [K in keyof T as RemovePrefix<K>]: SerializedMongoDocument<T[K]>;
      }
  : T;

export type MongoDocument<T> = T extends object
  ? T extends Date | Buffer | RegExp | Stream
    ? T
    : T extends Array<infer R>
    ? Array<MongoDocument<R>>
    : {
        [K in keyof T as AddPrefix<K>]:
          isUUID<K> extends true
          ? Binary
          : MongoDocument<T[K]>;
    }
  : T;

// export type Singular<T> = T extends `${infer S}s` ? S : T;

export type WithoutArrays<T> = T extends object
  ? T extends Array<infer R>
    ? WithoutArrays<R>
    : { [K in keyof T]: WithoutArrays<T[K]> }
  : T;

function isBinary(value: any): value is Binary {
  return value instanceof Binary;
}

// TODO: Better typing (input type inferrence/generics not working)
export function serializeMongoData(
  input: any,
): SerializedMongoDocument<typeof input> {
  if (
    typeof input === 'object' &&
    !(input === null) && 
    !(input instanceof Date) &&
    !(input instanceof Buffer)
  ) {
    if (isBinary(input)) {
      return muuidToUuid(input);
    }

    if (Array.isArray(input)) {
      return input.map(serializeMongoData);
    }

    return Object.keys(input).reduce((serializedInput, key) => {
      const value = input[key];
      let newKey = key;

      if (key[0] === '_') {
        newKey = key.slice(1);
      }

      serializedInput[newKey] = serializeMongoData(value);

      return serializedInput;
    }, {} as SerializedMongoDocument<typeof input>);
  }

  return input;
}

export function convertToMongoDocument(
  input: any,
  omitArrays?: false,
): MongoDocument<typeof input>
export function convertToMongoDocument(
  input: any,
  omitArrays?: true,
): WithoutArrays<MongoDocument<typeof input>>
export function convertToMongoDocument(
  input: any,
  omitArrays?: boolean,
): MongoDocument<typeof input>
export function convertToMongoDocument(
  input: any,
  omitArrays = false,
): MongoDocument<typeof input> {
  if (
    typeof input === 'object' &&
    !(input === null) && 
    !(input instanceof Date) &&
    !(input instanceof Buffer)
  ) {
    if (Array.isArray(input)) {
      if (omitArrays) {
        return;
      }

      return input.map(element => convertToMongoDocument(element, omitArrays));
    }

    return Object.keys(input).reduce((convertedInput, key) => {
      const value = input[key];
      let newKey = key;

      if (key[0] === '_') {
        newKey = key.slice(1);
      } else if (key === 'id') {
        newKey = `_${key}`;
      }

      convertedInput[newKey] = convertToMongoDocument(value, omitArrays);

      return convertedInput;
    }, {} as MongoDocument<typeof input>);
  }

  if (isUUID(input)) {
    return uuidToMuuid(input);
  }

  return input;
}

// TODO: typing
// TODO: Support status array (see OrderRepositoryAdapter status destructuring)
export function mongoQuery(input: object) {
  const convertedToMongo = convertToMongoDocument(input);
  const convertedToMongoDotNotation = flattenObject(convertedToMongo);

  return convertedToMongoDotNotation || {};
}

/* 
Deprecated but potentially useful

type RemapPrefixedProps<T> = T extends object
  ? T extends Date | Binary | Buffer | RegExp
    ? T
    : T extends Array<infer R>
    ? Array<RemapPrefixedProps<R>>
    : { [K in keyof T as RemovePrefix<K, P>]: RemapPrefixedProps<T[K]> }
  : T;

type DeepBinaryToUUID<T> = T extends object
  ? T extends Date | Buffer | RegExp
    ? T
    : T extends Binary
    ? UUID
    : T extends Array<infer R>
    ? Array<DeepBinaryToUUID<R>>
    : { [K in keyof T]: DeepBinaryToUUID<T[K]> }
  : T;

type SerializedMongoDocumentDeprecated<T> = RemapPrefixedProps<
  DeepBinaryToUUID<T>
>;
*/
