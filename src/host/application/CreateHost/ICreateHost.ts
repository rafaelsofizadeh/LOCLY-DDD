import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { Host } from '../../entity/Host';

export type CreateHostPayload = Readonly<{
  email: Email;
  country: Country;
}>;

export abstract class ICreateHost extends UseCase<CreateHostPayload, Host> {}
