import { UseCase } from '../../../common/application';
import { Address } from '../../../common/domain';
import { Host } from '../../entity/Host';
export declare type EditHostPayload = Readonly<{
    currentHostProperties: Pick<Host, 'id' | 'firstName' | 'lastName' | 'address'>;
    firstName?: string;
    lastName?: string;
    address?: Address;
}>;
export declare class EditHostRequest implements Omit<EditHostPayload, 'currentHostProperties'> {
    firstName?: string;
    lastName?: string;
    address?: Address;
}
export declare abstract class IEditHost extends UseCase<EditHostPayload, void> {
}
