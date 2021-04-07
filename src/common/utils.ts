import { Transform } from 'class-transformer';
import { Binary, ClientSession } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { EntityId } from './domain/EntityId';

export function enumToArray(inputEnum: any): any[] {
  const middle = Math.floor(inputEnum.length / 2);
  return Object.values(inputEnum).slice(0, middle);
}

export function muuidToString(id: Binary): string {
  return MUUID.from(id).toString();
}

export function muuidToEntityId(id: Binary): EntityId {
  return new EntityId(muuidToString(id));
}

export function entityIdToMuuid(id: EntityId): Binary {
  return MUUID.from(id.value);
}

export function stringToMuuid(id: string): Binary {
  return MUUID.from(id);
}

export function getRandomElement<T>(array: T[]): T {
  const elementCount = array.length;
  return array[Math.floor(Math.random() * elementCount)];
}

export function TransformEntityIdToString(): PropertyDecorator {
  return Transform(
    ({ value: decoratedId }: { value: EntityId }) => decoratedId?.value,
    {
      toPlainOnly: true,
    },
  );
}

export function TransformEntityIdArrayToStringArray(): PropertyDecorator {
  return Transform(
    ({ value: decoratedIdArray }: { value: EntityId[] }) =>
      decoratedIdArray.map(id => id.value),
    {
      toPlainOnly: true,
    },
  );
}

export function TransformStringToEntityId(): PropertyDecorator {
  return Transform(
    ({ value: decoratedIdRaw }: { value: string }) =>
      new EntityId(decoratedIdRaw),
    { toClassOnly: true },
  );
}

export async function withTransaction<T>(
  fn: () => Promise<T>,
  transaction: ClientSession,
): Promise<T> {
  try {
    let result: T;
    await transaction.withTransaction(async () => (result = await fn()));
    return result;
  } catch (error) {
    console.log('Transaction aborted.');
    throw error;
  } finally {
    await transaction.endSession({});
  }
}

// https://gist.github.com/penguinboy/762197
// TODO(NOW, IMPORTANT): "id" gets set on documents (when "_id" exists)
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
