import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
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

// https://gist.github.com/penguinboy/762197
export function flattenObject<T extends Record<string, any>>(
  object: T,
  path?: string,
  keyFilter?: (k: string) => boolean,
  valueFilter: (v: any) => boolean = (v: any) => v === undefined || v === null,
  separator: string = '.',
): T {
  return Object.keys(object).reduce((flatObjectAcc: T, key: string): T => {
    if (keyFilter && keyFilter(key)) {
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
  }, {} as T);
}

type RemovePrefix<
  T,
  P extends string = '_'
> = T extends `${P}${infer WithoutPrefix}` ? WithoutPrefix : T;

type AddPrefix<S, P extends string = '_'> = S extends string ? isUUID<S> extends true ? `${P}${S}` : S : S;

type isUUID<S extends string> = S extends '_id' | 'Id' ? true : false;

export type SerializedMongoDocument<
  T,
  P extends string = '_'
> = T extends object
  ? T extends Date | Buffer | RegExp
    ? T
    : T extends Binary
    ? UUID
    : T extends Array<infer R>
    ? Array<SerializedMongoDocument<R>>
    : {
        [K in keyof T as RemovePrefix<K, P>]: SerializedMongoDocument<T[K]>;
      }
  : T;

export type ConvertedToMongoDocument<
  T,
  P extends string = '_'
> = T extends object
  ? T extends Date | Buffer | RegExp
    ? T
    : T extends Array<infer R>
    ? Array<ConvertedToMongoDocument<R>>
    : {
        [K in keyof T as AddPrefix<K, P>]: ConvertedToMongoDocument<T[K]>;
      }
  : T extends string
  ? isUUID<T> extends true
  ? Binary
  : T
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
): ConvertedToMongoDocument<typeof input> {
  if (
    typeof input === 'object' &&
    !(input instanceof Date) &&
    !(input instanceof Buffer)
  ) {
    if (Array.isArray(input)) {
      return input.map(convertToMongoDocument);
    }

    return Object.keys(input).reduce((convertedInput, key) => {
      const value = input[key];
      let newKey = key;

      if (key[0] === '_') {
        newKey = key.slice(1);
      } else if (key === 'id') {
        newKey = `_${key}`;
      }

      convertedInput[newKey] = convertToMongoDocument(value);

      return convertedInput;
    }, {} as ConvertedToMongoDocument<typeof input>);
  }

  
  if (isUUID(input)) {
    return uuidToMuuid(input);
  }

  return input;
}

/* 
Deprecated but potentially useful

type RemapPrefixedProps<T, P extends string = '_'> = T extends object
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