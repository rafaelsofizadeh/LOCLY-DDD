import { UseCase } from '../../../common/application';
import { Email, UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';
export interface GetHostPayload {
    readonly hostId?: UUID;
    readonly email?: Email;
}
export declare class GetHostRequest implements GetHostPayload {
    readonly email?: Email;
    readonly hostId?: UUID;
}
export declare abstract class IGetHost extends UseCase<GetHostPayload, Host> {
}
