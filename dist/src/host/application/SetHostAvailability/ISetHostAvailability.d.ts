import { UseCase } from '../../../common/application';
import { Host } from '../../entity/Host';
export declare type SetHostAvailabilityPayload = Readonly<{
    host: Host;
    available: boolean;
}>;
export declare class SetHostAvailabilityRequest implements Omit<SetHostAvailabilityPayload, 'host'> {
    available: boolean;
}
export declare abstract class ISetHostAvailability extends UseCase<SetHostAvailabilityPayload, void> {
}
