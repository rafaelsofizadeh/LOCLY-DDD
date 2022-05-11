"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAuth = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
const utils_1 = require("../utils");
let VerifyAuth = class VerifyAuth {
    execute(verificationToken) {
        return this.verificationTokenToAuthToken(verificationToken);
    }
    verificationTokenToAuthToken({ id, type }) {
        const { tokenKey, verificationTokenExpiration, authTokenExpiration, } = app_configuration_1.default.auth;
        return (0, utils_1.tokenToString)({ id, type, isVerification: false }, tokenKey, authTokenExpiration);
    }
};
VerifyAuth = __decorate([
    (0, common_1.Injectable)()
], VerifyAuth);
exports.VerifyAuth = VerifyAuth;
//# sourceMappingURL=VerifyAuth.js.map