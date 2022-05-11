"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenToString = exports.stringToToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function stringToToken(tokenString, key) {
    try {
        const { exp, iat, ...token } = jsonwebtoken_1.default.verify(tokenString, key);
        return { token };
    }
    catch ({ name, expiredAt, message: errorMessage }) {
        if (name === 'TokenExpiredError') {
            return { expiredAt, errorMessage };
        }
        if (name === 'JsonWebTokenError') {
            return { errorMessage };
        }
    }
}
exports.stringToToken = stringToToken;
function tokenToString(token, key, expiresIn) {
    const tokenString = jsonwebtoken_1.default.sign(token, key, { expiresIn });
    return tokenString;
}
exports.tokenToString = tokenToString;
//# sourceMappingURL=utils.js.map