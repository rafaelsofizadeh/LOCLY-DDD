"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeItemFilter = exports.normalizeOrderFilter = void 0;
function normalizeOrderFilter({ orderId, status, ...restFilter }) {
    return {
        ...(orderId && { id: orderId }),
        ...(status && {
            status: Array.isArray(status) ? { $in: status } : status,
        }),
        ...restFilter,
    };
}
exports.normalizeOrderFilter = normalizeOrderFilter;
function normalizeItemFilter({ itemId, ...restFilter }) {
    return { ...(itemId && { id: itemId }), ...restFilter };
}
exports.normalizeItemFilter = normalizeItemFilter;
//# sourceMappingURL=OrderMongoMapper.js.map