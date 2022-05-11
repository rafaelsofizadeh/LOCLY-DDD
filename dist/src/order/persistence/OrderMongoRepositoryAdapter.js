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
exports.OrderMongoRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const nest_mongodb_1 = require("nest-mongodb");
const class_validator_1 = require("class-validator");
const error_handling_1 = require("../../common/error-handling");
const OrderMongoMapper_1 = require("./OrderMongoMapper");
const persistence_1 = require("../../common/persistence");
let OrderMongoRepositoryAdapter = class OrderMongoRepositoryAdapter {
    orderCollection;
    constructor(orderCollection) {
        this.orderCollection = orderCollection;
    }
    async addOrder(draftOrder, mongoTransactionSession) {
        const draftOrderDocument = (0, persistence_1.convertToMongoDocument)(draftOrder);
        const { modifiedCount, upsertedCount, } = await this.orderCollection
            .replaceOne({ _id: draftOrderDocument._id }, draftOrderDocument, {
            upsert: true,
            session: mongoTransactionSession,
        })
            .catch((0, error_handling_1.throwCustomException)('Error creating a new draftOrder in the database', { draftOrder, draftOrderDocument }));
        (0, error_handling_1.expectOnlySingleResult)([modifiedCount + upsertedCount], {
            operation: 'setting properties on',
            entity: 'order',
        }, { orderId: draftOrder.id });
    }
    async setProperties(filter, properties, mongoTransactionSession) {
        if (!(0, class_validator_1.isNotEmptyObject)(filter) || !(0, class_validator_1.isNotEmptyObject)(properties)) {
            return;
        }
        const filterWithId = (0, OrderMongoMapper_1.normalizeOrderFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const updateQuery = (0, persistence_1.mongoQuery)(properties);
        const { matchedCount, modifiedCount, } = await this.orderCollection
            .updateOne(filterQuery, { $set: updateQuery }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error updating order', {
            filter,
            properties,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'setting properties on',
            entity: 'order',
        }, { filter, properties });
    }
    async findOrder(filter, mongoTransactionSession, throwIfNotFound = true) {
        const { status, ...restFilter } = (0, OrderMongoMapper_1.normalizeOrderFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(restFilter);
        const orderDocument = await this.orderCollection
            .findOne({ ...filterQuery, ...(status && { status }) }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error searching for an order', filter));
        if (!orderDocument) {
            if (throwIfNotFound) {
                (0, error_handling_1.throwCustomException)('No order found', filter)();
            }
            return;
        }
        return (0, persistence_1.serializeMongoData)(orderDocument);
    }
    async findOrders(orderIds, mongoTransactionSession) {
        const orderMongoBinaryIds = orderIds.map(orderId => (0, persistence_1.uuidToMuuid)(orderId));
        const orderDocuments = await this.orderCollection
            .find({ _id: { $in: orderMongoBinaryIds } }, { session: mongoTransactionSession })
            .toArray();
        if (orderDocuments.length !== orderIds.length) {
            const failedOrderIds = orderIds.filter(orderId => orderDocuments.findIndex(orderDocument => (0, persistence_1.uuidToMuuid)(orderId) === orderDocument._id) === -1);
            (0, error_handling_1.throwCustomException)('Orders not found', {
                orderIds,
                failedOrderIds,
            })();
        }
        return orderDocuments.map(orderDocument => (0, persistence_1.serializeMongoData)(orderDocument));
    }
    async deleteOrder(filter, mongoTransactionSession) {
        const filterWithId = (0, OrderMongoMapper_1.normalizeOrderFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const { deletedCount, } = await this.orderCollection
            .deleteOne(filterQuery, {
            session: mongoTransactionSession,
        })
            .catch((0, error_handling_1.throwCustomException)('Error deleting order', filter));
        (0, error_handling_1.expectOnlySingleResult)([deletedCount], {
            operation: 'deleting',
            entity: 'order',
        }, filter);
    }
    async deleteOrders(orderIds, mongoTransactionSession) {
        const orderMongoBinaryIds = orderIds.map(orderId => (0, persistence_1.uuidToMuuid)(orderId));
        const { deletedCount, } = await this.orderCollection
            .deleteMany({ _id: { $in: orderMongoBinaryIds } }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error deleting many orders', { orderIds }));
        (0, error_handling_1.expectOnlyNResults)(orderIds.length, [deletedCount], {
            operation: 'deleting',
            entity: 'order',
        });
    }
    async setItemProperties(orderFilter, itemFilter, properties, mongoTransactionSession) {
        if (!(0, class_validator_1.isNotEmptyObject)(orderFilter) ||
            !(0, class_validator_1.isNotEmptyObject)(itemFilter) ||
            !(0, class_validator_1.isNotEmptyObject)(properties)) {
            return;
        }
        const orderFilterWithId = (0, OrderMongoMapper_1.normalizeOrderFilter)(orderFilter);
        const itemFilterWithId = (0, OrderMongoMapper_1.normalizeItemFilter)(itemFilter);
        const filter = {
            ...orderFilterWithId,
            items: itemFilterWithId,
        };
        const filterQuery = {
            ...(0, persistence_1.mongoQuery)(orderFilterWithId),
            items: { $elemMatch: { ...(0, persistence_1.mongoQuery)(itemFilterWithId) } },
        };
        const itemSetQuery = (0, persistence_1.mongoQuery)({ 'items.$': properties });
        const { matchedCount, modifiedCount, } = await this.orderCollection
            .updateOne(filterQuery, { $set: itemSetQuery }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error updating order item', {
            filter,
            properties,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'setting properties on',
            entity: 'order item',
            lessThanMessage: "the item either doesn't exist, or has already been received",
        }, {
            filter,
            properties,
        });
    }
    async addItemPhotos(orderFilter, itemFilter, photos, mongoTransactionSession) {
        const { status, ...restOrderFilterWithId } = (0, OrderMongoMapper_1.normalizeOrderFilter)(orderFilter);
        const itemFilterWithId = (0, OrderMongoMapper_1.normalizeItemFilter)(itemFilter);
        const filterQuery = {
            ...(0, persistence_1.mongoQuery)(restOrderFilterWithId),
            ...(status && { status }),
            items: {
                $elemMatch: (0, persistence_1.mongoQuery)(itemFilterWithId),
            },
        };
        const photoMuuids = photos.map(({ id }) => id);
        const photoUploadResults = photos.map(({ id, filename }) => ({
            id: (0, persistence_1.muuidToUuid)(id),
            name: filename,
        }));
        const { matchedCount, modifiedCount, } = await this.orderCollection
            .updateOne(filterQuery, {
            $push: {
                'items.$.photoIds': {
                    $each: photoMuuids,
                },
            },
        }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error adding photo file id to order item', {
            orderFilter,
            itemFilter,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'adding photo id to',
            entity: 'order item',
        }, {
            orderFilter,
            itemFilter,
        });
        return photoUploadResults;
    }
    async addFile(orderFilter, file, mongoTransactionSession) {
        const { status, ...restNormalizedOrderFilter } = (0, OrderMongoMapper_1.normalizeOrderFilter)(orderFilter);
        const filterQuery = {
            ...(0, persistence_1.mongoQuery)(restNormalizedOrderFilter),
            ...(status && { status }),
        };
        const fileUploadResult = {
            id: (0, persistence_1.muuidToUuid)(file.id),
            name: file.filename,
        };
        const { matchedCount, modifiedCount, } = await this.orderCollection
            .updateOne(filterQuery, {
            $set: { proofOfPayment: fileUploadResult.id },
        }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error adding file id to order', {
            orderFilter,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'adding file id to',
            entity: 'order',
        }, {
            orderFilter,
        });
        return fileUploadResult;
    }
};
OrderMongoRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nest_mongodb_1.InjectCollection)('orders')),
    __metadata("design:paramtypes", [Object])
], OrderMongoRepositoryAdapter);
exports.OrderMongoRepositoryAdapter = OrderMongoRepositoryAdapter;
//# sourceMappingURL=OrderMongoRepositoryAdapter.js.map