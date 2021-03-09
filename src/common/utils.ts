import { Transform } from 'class-transformer';
import { Binary } from 'mongodb';
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
