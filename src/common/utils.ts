import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { EntityId } from './domain/EntityId';

export function enumToArray(inputEnum: any): any[] {
  const middle = Math.floor(inputEnum.length / 2);
  return Object.values(inputEnum).slice(0, middle);
}

export function muuidToEntityId(id: Binary): EntityId {
  return new EntityId(MUUID.from(id).toString());
}

export function getRandomElement<T>(array: T[]): T {
  const elementCount = array.length;
  return array[Math.floor(Math.random() * elementCount)];
}
