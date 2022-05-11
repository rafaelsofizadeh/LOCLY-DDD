import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
export interface DeleteHostPayload {
    hostId: UUID;
}
export declare type DeleteHostResult = void;
export declare abstract class IDeleteHost extends UseCase<DeleteHostPayload, DeleteHostResult> {
}
