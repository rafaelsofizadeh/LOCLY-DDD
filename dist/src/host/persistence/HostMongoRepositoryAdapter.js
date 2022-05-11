"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostMongoRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const nest_mongodb_1 = require("nest-mongodb");
const HostMongoMapper_1 = require("./HostMongoMapper");
const error_handling_1 = require("../../common/error-handling");
const persistence_1 = require("../../common/persistence");
const class_validator_1 = require("class-validator");
let HostMongoRepositoryAdapter = class HostMongoRepositoryAdapter {
    hostCollection;
    constructor(hostCollection) {
        this.hostCollection = hostCollection;
    }
    async addManyHosts(hosts, mongoTransactionSession) {
        const hostDocuments = hosts.map(HostMongoMapper_1.hostToMongoDocument);
        const { insertedCount, } = await this.hostCollection
            .insertMany(hostDocuments, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error adding many hosts', { hosts }));
        (0, error_handling_1.expectOnlyNResults)(hosts.length, [insertedCount], {
            operation: 'inserting',
            entity: 'host',
        });
    }
    async addHost(host, mongoTransactionSession) {
        const hostDocument = (0, HostMongoMapper_1.hostToMongoDocument)(host);
        await this.hostCollection
            .insertOne(hostDocument, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error adding host', { host }));
    }
    async deleteManyHosts(hostIds, mongoTransactionSession) {
        const { deletedCount, } = await this.hostCollection
            .deleteMany({ _id: { $in: hostIds.map(hostId => (0, persistence_1.uuidToMuuid)(hostId)) } }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error deleting many hosts', { hostIds }));
        (0, error_handling_1.expectOnlyNResults)(hostIds.length, [deletedCount], {
            operation: 'deleting',
            entity: 'host',
        });
    }
    async deleteHost(filter, mongoTransactionSession) {
        const filterWithId = (0, HostMongoMapper_1.normalizeHostFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const { deletedCount, } = await this.hostCollection
            .deleteOne(filterQuery, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)("Couldn't delete host", filter));
        (0, error_handling_1.expectOnlySingleResult)([deletedCount], {
            operation: 'deleting',
            entity: 'host',
        });
    }
    async setProperties(filter, properties, mongoTransactionSession) {
        if (!(0, class_validator_1.isNotEmptyObject)(filter) || !(0, class_validator_1.isNotEmptyObject)(properties)) {
            throw new Error("setProperties – filter and/or properties can't be empty");
        }
        const filterWithId = (0, HostMongoMapper_1.normalizeHostFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const updateQuery = (0, persistence_1.mongoQuery)(properties);
        await this.hostCollection
            .updateOne(filterQuery, { $set: updateQuery }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error updating host', {
            filter,
            properties,
        }));
    }
    async addOrderToHost(filter, orderId, mongoTransactionSession) {
        const filterWithId = (0, HostMongoMapper_1.normalizeHostFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const { matchedCount, modifiedCount, } = await this.hostCollection
            .updateOne(filterQuery, { $push: { orderIds: (0, persistence_1.uuidToMuuid)(orderId) } }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error adding order to host', {
            hostFilter: filter,
            orderId,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'adding order to',
            entity: 'host',
        });
    }
    async findHost(filter, mongoTransactionSession, throwIfNotFound = true) {
        const filterWithId = (0, HostMongoMapper_1.normalizeHostFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const hostDocument = await this.hostCollection
            .findOne(filterQuery, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error searching for a host', filter));
        if (!hostDocument) {
            if (throwIfNotFound) {
                (0, error_handling_1.throwCustomException)('No host found', filter, common_1.HttpStatus.NOT_FOUND)();
            }
            return;
        }
        return (0, HostMongoMapper_1.mongoDocumentToHost)(hostDocument);
    }
    async findHostAvailableInCountryWithMinimumNumberOfOrders(country, mongoTransactionSession) {
        const [hostDocument] = await this.hostCollection
            .aggregate([
            {
                $match: {
                    'address.country': country,
                    verified: true,
                    available: true,
                },
            },
            {
                $addFields: {
                    orderCount: {
                        $size: '$orderIds',
                    },
                },
            },
            {
                $sort: {
                    orderCount: 1,
                },
            },
            { $limit: 1 },
        ], { session: mongoTransactionSession })
            .toArray()
            .catch((0, error_handling_1.throwCustomException)('Error searching for available hosts', {
            country,
        }));
        if (!hostDocument) {
            (0, error_handling_1.throwCustomException)(`No host available in ${country}.`, { country }, common_1.HttpStatus.SERVICE_UNAVAILABLE)();
        }
        return (0, HostMongoMapper_1.mongoDocumentToHost)(hostDocument);
    }
};
HostMongoRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nest_mongodb_1.InjectCollection)('hosts')),
    __metadata("design:paramtypes", [Object])
], HostMongoRepositoryAdapter);
exports.HostMongoRepositoryAdapter = HostMongoRepositoryAdapter;
//# sourceMappingURL=HostMongoRepositoryAdapter.js.map