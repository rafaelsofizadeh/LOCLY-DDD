import { Country } from '../order/entity/Country';
export declare type WithoutId<T> = Omit<T, 'id'>;
export declare type Modify<T, R> = Omit<T, keyof R> & R;
export declare type UUID = string;
export declare const UUID: (id?: UUID) => string;
export declare const IsUUID: () => PropertyDecorator;
export declare const isUUID: (input: unknown) => input is string;
export declare type Email = string;
export declare type Address = Readonly<{
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    administrativeArea?: string;
    country: Country;
    postalCode?: string;
}>;
export declare class AddressValidationSchema implements Address {
    readonly addressLine1: string;
    readonly addressLine2?: string;
    readonly locality: string;
    readonly administrativeArea?: string;
    readonly country: Country;
    readonly postalCode: string;
}
