import { IsBoolean } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Host } from '../../entity/Host';

export type SetHostAvailabilityPayload = Readonly<{
  host: Host;
  available: boolean;
}>;

export class SetHostAvailabilityRequest
  implements Omit<SetHostAvailabilityPayload, 'host'> {
  @IsBoolean()
  available: boolean;
}

export abstract class ISetHostAvailability extends UseCase<
  SetHostAvailabilityPayload,
  void
> {}
