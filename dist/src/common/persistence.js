"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoQuery = exports.convertToMongoDocument = exports.serializeMongoData = exports.flattenObject = exports.uuidToMuuid = exports.muuidToUuid = void 0;
const mongodb_1 = require("mongodb");
const uuid_mongodb_1 = __importDefault(require("uuid-mongodb"));
const domain_1 = require("./domain");
function muuidToString(id) {
    return uuid_mongodb_1.default.from(id).toString();
}
function muuidToUuid(id) {
    return (0, domain_1.UUID)(muuidToString(id));
}
exports.muuidToUuid = muuidToUuid;
function uuidToMuuid(id) {
    return uuid_mongodb_1.default.from(id);
}
exports.uuidToMuuid = uuidToMuuid;
function flattenObject(object, path, keyFilter, valueFilter, separator = '.') {
    const keys = Object.keys(object);
    return keys.reduce((flatObjectAcc, key) => {
        if (keyFilter && !keyFilter(key)) {
            return flatObjectAcc;
        }
        const value = object[key];
        if (valueFilter && valueFilter(value)) {
            return flatObjectAcc;
        }
        const newPath = [path, key].filter(Boolean).join(separator);
        const isObject = [
            typeof value === 'object',
            value !== null,
            !(value instanceof Date),
            !(value instanceof RegExp),
            !(value instanceof mongodb_1.Binary),
            !(Array.isArray(value) && value.length === 0),
        ].every(Boolean);
        return isObject
            ? {
                ...flatObjectAcc,
                ...flattenObject(value, newPath, keyFilter, valueFilter, separator),
            }
            : { ...flatObjectAcc, [newPath]: value };
    }, {});
}
exports.flattenObject = flattenObject;
function isBinary(value) {
    return value instanceof mongodb_1.Binary;
}
function serializeMongoData(input) {
    if (typeof input === 'object' &&
        !(input === null) &&
        !(input instanceof Date) &&
        !(input instanceof Buffer)) {
        if (isBinary(input)) {
            return muuidToUuid(input);
        }
        if (Array.isArray(input)) {
            return input.map(serializeMongoData);
        }
        return Object.keys(input).reduce((serializedInput, key) => {
            const value = input[key];
            let newKey = key;
            if (key[0] === '_') {
                newKey = key.slice(1);
            }
            serializedInput[newKey] = serializeMongoData(value);
            return serializedInput;
        }, {});
    }
    return input;
}
exports.serializeMongoData = serializeMongoData;
function convertToMongoDocument(input, omitArrays = false) {
    if (typeof input === 'object' &&
        !(input === null) &&
        !(input instanceof Date) &&
        !(input instanceof Buffer)) {
        if (Array.isArray(input)) {
            if (omitArrays) {
                return;
            }
            return input.map(element => convertToMongoDocument(element, omitArrays));
        }
        return Object.keys(input).reduce((convertedInput, key) => {
            const value = input[key];
            let newKey = key;
            if (key[0] === '_') {
                newKey = key.slice(1);
            }
            else if (key === 'id') {
                newKey = `_${key}`;
            }
            convertedInput[newKey] = convertToMongoDocument(value, omitArrays);
            return convertedInput;
        }, {});
    }
    if ((0, domain_1.isUUID)(input)) {
        return uuidToMuuid(input);
    }
    return input;
}
exports.convertToMongoDocument = convertToMongoDocument;
function mongoQuery(input) {
    const convertedToMongo = convertToMongoDocument(input);
    const convertedToMongoDotNotation = flattenObject(convertedToMongo);
    return convertedToMongoDotNotation || {};
}
exports.mongoQuery = mongoQuery;
//# sourceMappingURL=persistence.js.map