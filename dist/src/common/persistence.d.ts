/// <reference types="node" />
import { Binary } from 'mongodb';
import { Stream } from 'stream';
import { OrderStatus } from '../order/entity/Order';
import { isUUID, UUID } from './domain';
export declare function muuidToUuid(id: Binary): UUID;
export declare function uuidToMuuid(id: UUID): Binary;
export declare type EntityFilter<T extends {
    id: UUID;
}, Id> = Partial<Omit<T, 'id' | 'status'> & {
    status: OrderStatus | OrderStatus[];
} & Id>;
declare type PathsToStringProps<T> = T extends string ? [] : {
    [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
}[Extract<keyof T, string>];
declare type Join<T extends string[], D extends string> = T extends [] ? never : T extends [infer F] ? F : T extends [infer F, ...infer R] ? F extends string ? `${F}${D}${Join<Extract<R, string[]>, D>}` : never : string;
export declare function flattenObject<T extends Record<string, any>>(object: T, path?: string, keyFilter?: (k: string) => boolean, valueFilter?: (v: any) => boolean, separator?: string): {
    [K in keyof T as Join<PathsToStringProps<T[K]>, '.'>]: T[K] extends object ? never : T[K];
};
declare type isUUID<S> = S extends string ? S extends 'id' | `${infer IdOfEntity}Id` ? true : false : false;
declare type RemovePrefix<T> = T extends `_${infer WithoutPrefix}` ? WithoutPrefix : T;
declare type AddPrefix<S> = S extends string ? isUUID<S> extends true ? `_${S}` : S : S;
export declare type SerializedMongoDocument<T> = T extends object ? T extends Date | Buffer | RegExp | Stream ? T : T extends Binary ? UUID : T extends Array<infer R> ? Array<SerializedMongoDocument<R>> : {
    [K in keyof T as RemovePrefix<K>]: SerializedMongoDocument<T[K]>;
} : T;
export declare type MongoDocument<T> = T extends object ? T extends Date | Buffer | RegExp | Stream ? T : T extends Array<infer R> ? Array<MongoDocument<R>> : {
    [K in keyof T as AddPrefix<K>]: isUUID<K> extends true ? Binary : MongoDocument<T[K]>;
} : T;
export declare type WithoutArrays<T> = T extends object ? T extends Array<infer R> ? WithoutArrays<R> : {
    [K in keyof T]: WithoutArrays<T[K]>;
} : T;
export declare function serializeMongoData(input: any): SerializedMongoDocument<typeof input>;
export declare function convertToMongoDocument(input: any, omitArrays?: false): MongoDocument<typeof input>;
export declare function convertToMongoDocument(input: any, omitArrays?: true): WithoutArrays<MongoDocument<typeof input>>;
export declare function convertToMongoDocument(input: any, omitArrays?: boolean): MongoDocument<typeof input>;
export declare function mongoQuery(input: object): {
    [x: `${string}.${string}`]: any;
};
export {};
