"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHostFilter = exports.hostToMongoDocument = exports.mongoDocumentToHost = void 0;
const persistence_1 = require("../../common/persistence");
function mongoDocumentToHost(hostMongoDocument) {
    return (0, persistence_1.serializeMongoData)(hostMongoDocument);
}
exports.mongoDocumentToHost = mongoDocumentToHost;
function hostToMongoDocument(host) {
    const hostMongoDocument = (0, persistence_1.convertToMongoDocument)(host);
    return hostMongoDocument;
}
exports.hostToMongoDocument = hostToMongoDocument;
function normalizeHostFilter({ hostId, ...restFilter }) {
    return {
        ...(hostId && { id: hostId }),
        ...restFilter,
    };
}
exports.normalizeHostFilter = normalizeHostFilter;
//# sourceMappingURL=HostMongoMapper.js.map