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
exports.CustomerMongoRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const nest_mongodb_1 = require("nest-mongodb");
const CustomerMongoMapper_1 = require("./CustomerMongoMapper");
const error_handling_1 = require("../../common/error-handling");
const persistence_1 = require("../../common/persistence");
const class_validator_1 = require("class-validator");
var ArrayAction;
(function (ArrayAction) {
    ArrayAction["Add"] = "add";
    ArrayAction["Remove"] = "remove";
})(ArrayAction || (ArrayAction = {}));
let CustomerMongoRepositoryAdapter = class CustomerMongoRepositoryAdapter {
    customerCollection;
    constructor(customerCollection) {
        this.customerCollection = customerCollection;
    }
    async addCustomer(customer, mongoTransactionSession) {
        const customerDocument = (0, CustomerMongoMapper_1.customerToMongoDocument)(customer);
        await this.customerCollection
            .insertOne(customerDocument, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error adding a customer', {
            customer,
        }));
    }
    async deleteCustomer(filter, mongoTransactionSession) {
        const filterWithId = (0, CustomerMongoMapper_1.normalizeCustomerFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const { deletedCount, } = await this.customerCollection
            .deleteOne(filterQuery, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error deleting a customer', filter));
        (0, error_handling_1.expectOnlySingleResult)([deletedCount], {
            operation: 'deleting',
            entity: 'customer',
        });
    }
    async addOrder(filter, orderId, mongoTransactionSession) {
        await this.addOrRemoveEntityToArrayProp(ArrayAction.Add, filter, 'orderIds', orderId, mongoTransactionSession);
    }
    async removeOrder(filter, orderId, mongoTransactionSession) {
        await this.addOrRemoveEntityToArrayProp(ArrayAction.Remove, filter, 'orderIds', orderId, mongoTransactionSession);
    }
    async addOrRemoveEntityToArrayProp(action, filter, prop, entity, mongoTransactionSession) {
        const filterWithId = (0, CustomerMongoMapper_1.normalizeCustomerFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const queryArgument = { [prop]: entity };
        const updateQuery = action === 'add' ? { $push: queryArgument } : { $pull: queryArgument };
        const errorAction = `${action === 'add' ? 'adding to' : 'removing from'}`;
        const { matchedCount, modifiedCount, } = await this.customerCollection
            .updateOne(filterQuery, updateQuery, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)(`Error ${errorAction} a customer ${prop}`, {
            action,
            [prop]: entity,
            customerFilter: filter,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: `${errorAction} ${prop} of`,
            entity: 'customer',
        }, { customerFilter: filter, [prop]: entity });
    }
    async findCustomer(filter, mongoTransactionSession, throwIfNotFound = true) {
        const filterWithId = (0, CustomerMongoMapper_1.normalizeCustomerFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const customerDocument = await this.customerCollection
            .findOne(filterQuery, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error finding a customer', filter));
        if (!customerDocument) {
            if (throwIfNotFound) {
                (0, error_handling_1.throwCustomException)('No customer found', filter, common_1.HttpStatus.NOT_FOUND)();
            }
            return;
        }
        return (0, CustomerMongoMapper_1.mongoDocumentToCustomer)(customerDocument);
    }
    async setProperties(filter, properties, mongoTransactionSession) {
        if (!(0, class_validator_1.isNotEmptyObject)(filter) || !(0, class_validator_1.isNotEmptyObject)(properties)) {
            return;
        }
        const filterWithId = (0, CustomerMongoMapper_1.normalizeCustomerFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const updateQuery = (0, persistence_1.convertToMongoDocument)(properties);
        const { matchedCount, modifiedCount, } = await this.customerCollection
            .updateOne(filterQuery, { $set: updateQuery }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error updating customer', {
            filter,
            properties,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'setting properties on',
            entity: 'customer',
        }, { filter, properties });
    }
    async updateBalance(filter, deltaUsdCents, mongoTransactionSession) {
        if (!(0, class_validator_1.isNotEmptyObject)(filter)) {
            return;
        }
        const filterWithId = (0, CustomerMongoMapper_1.normalizeCustomerFilter)(filter);
        const filterQuery = (0, persistence_1.mongoQuery)(filterWithId);
        const { matchedCount, modifiedCount, } = await this.customerCollection
            .updateOne(filterQuery, { $inc: { balanceUsdCents: deltaUsdCents } }, { session: mongoTransactionSession })
            .catch((0, error_handling_1.throwCustomException)('Error updating balance', {
            filter,
        }));
        (0, error_handling_1.expectOnlySingleResult)([matchedCount, modifiedCount], {
            operation: 'updating balance',
            entity: 'customer',
        }, { filter });
    }
};
CustomerMongoRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nest_mongodb_1.InjectCollection)('customers')),
    __metadata("design:paramtypes", [Object])
], CustomerMongoRepositoryAdapter);
exports.CustomerMongoRepositoryAdapter = CustomerMongoRepositoryAdapter;
//# sourceMappingURL=CustomerMongoRepositoryAdapter.js.map