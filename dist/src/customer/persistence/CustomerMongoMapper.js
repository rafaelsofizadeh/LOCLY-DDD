"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCustomerFilter = exports.customerToMongoDocument = exports.mongoDocumentToCustomer = void 0;
const persistence_1 = require("../../common/persistence");
function mongoDocumentToCustomer(customerMongoDocument) {
    return (0, persistence_1.serializeMongoData)(customerMongoDocument);
}
exports.mongoDocumentToCustomer = mongoDocumentToCustomer;
function customerToMongoDocument(customer) {
    const customerMongoDocument = (0, persistence_1.convertToMongoDocument)(customer);
    return customerMongoDocument;
}
exports.customerToMongoDocument = customerToMongoDocument;
function normalizeCustomerFilter({ customerId, ...restFilter }) {
    return {
        ...(customerId && { id: customerId }),
        ...restFilter,
    };
}
exports.normalizeCustomerFilter = normalizeCustomerFilter;
//# sourceMappingURL=CustomerMongoMapper.js.map