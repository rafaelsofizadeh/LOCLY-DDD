import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface DeleteHostPayload {
  hostId: UUID;
}

export type DeleteHostResult = void;

export abstract class IDeleteHost extends UseCase<
  DeleteHostPayload,
  DeleteHostResult
> {}
