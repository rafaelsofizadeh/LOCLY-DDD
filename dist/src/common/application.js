"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStripeFee = exports.stripePrice = exports.withTransaction = exports.Transaction = exports.UseCase = void 0;
const nest_mongodb_1 = require("nest-mongodb");
class UseCase {
}
exports.UseCase = UseCase;
function Transaction(target, key, descriptor) {
    const injectMongoClient = (0, nest_mongodb_1.InjectClient)();
    injectMongoClient(target, 'mongoClient');
    const fn = descriptor.value;
    descriptor.value = function ({ mongoTransactionSession, ...nonTransactionArgs }) {
        const boundFn = fn.bind(this);
        return withTransaction((newSession) => boundFn({
            ...nonTransactionArgs,
            mongoTransactionSession: newSession,
        }), this.mongoClient, mongoTransactionSession);
    };
    return descriptor;
}
exports.Transaction = Transaction;
async function withTransaction(fn, mongoClient, mongoTransactionSession) {
    return mongoTransactionSession === undefined
        ? await withNewSessionTransaction(mongoClient, fn)
        : await withExistingSessionTransaction(mongoTransactionSession, fn);
}
exports.withTransaction = withTransaction;
async function withExistingSessionTransaction(mongoTransactionSession, fn) {
    if (mongoTransactionSession.inTransaction()) {
        const result = await fn(mongoTransactionSession);
        return result;
    }
    let result;
    await mongoTransactionSession.withTransaction(async () => {
        result = await fn(mongoTransactionSession);
    });
    return result;
}
async function withNewSessionTransaction(mongoClient, fn) {
    let result;
    await mongoClient.withSession(async (mongoTransactionSession) => await mongoTransactionSession.withTransaction(async (sessionWithTransaction) => {
        result = await fn(sessionWithTransaction);
    }));
    return result;
}
function stripePrice({ currency, amount }) {
    return {
        currency: currency.toLocaleLowerCase(),
        unit_amount: Math.floor(amount * 100),
    };
}
exports.stripePrice = stripePrice;
function calculateStripeFee(unitAmount) {
    return unitAmount * 2.9 * 0.01 + 30;
}
exports.calculateStripeFee = calculateStripeFee;
//# sourceMappingURL=application.js.map