import { IsUUID as IsUUIDValidator } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export type UUID = string;
export const UUID = (id?: UUID) => (id || uuidv4()) as UUID;
export const IsUUID = () => IsUUIDValidator(4);
