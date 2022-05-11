import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { Host } from '../../entity/Host';
export declare type GetHostUpsertPayload = Readonly<{
    email: UUID;
    country?: Country;
}>;
export declare type GetHostUpsertResult = {
    host: Host;
    upsert: boolean;
};
export declare abstract class IGetHostUpsert extends UseCase<GetHostUpsertPayload, GetHostUpsertResult> {
}
