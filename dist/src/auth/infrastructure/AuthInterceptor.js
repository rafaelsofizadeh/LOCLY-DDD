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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieAuthInterceptor = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../../app.configuration"));
const Token_1 = require("../entity/Token");
const utils_1 = require("../application/utils");
const IHostRepository_1 = require("../../host/persistence/IHostRepository");
const error_handling_1 = require("../../common/error-handling");
const Identity_1 = require("../entity/Identity");
let CookieAuthInterceptor = class CookieAuthInterceptor {
    hostRepository;
    constructor(hostRepository) {
        this.hostRepository = hostRepository;
    }
    getCookies(request) {
        return {
            ...request.cookies,
            ...request.signedCookies,
        };
    }
    async tokenToIdentity(token) {
        if (!token) {
            return { entity: null, type: Identity_1.IdentityType.Anonymous };
        }
        if (token.isVerification) {
            return { entity: token, type: Identity_1.IdentityType.VerificationToken };
        }
        if (token.type === Token_1.UserType.Customer) {
            return { entity: token.id, type: Identity_1.IdentityType.Customer };
        }
        if (token.type === Token_1.UserType.Host) {
            const host = await this.hostRepository
                .findHost({
                hostId: token.id,
            })
                .catch((0, error_handling_1.throwCustomException)('Host not found', { hostId: token.id }, common_1.HttpStatus.NOT_FOUND));
            return {
                entity: host,
                type: host.verified ? Identity_1.IdentityType.Host : Identity_1.IdentityType.UnverifiedHost,
            };
        }
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const path = request.path;
        if (path === 'stripe/webhook' || path === 'order/logout') {
            return next.handle();
        }
        const cookies = this.getCookies(request);
        const authIndicatorCookieName = app_configuration_1.default.cookie.authIndicatorName;
        const authIndicator = cookies?.[authIndicatorCookieName];
        if (response && !authIndicator) {
            response.cookie(authIndicatorCookieName, false, {
                ...app_configuration_1.default.cookie.cors,
                httpOnly: false,
                maxAge: 365 * 24 * 60 * 60 * 10,
            });
        }
        const tokenString = cookies?.[app_configuration_1.default.cookie.tokenName];
        let token;
        if (tokenString) {
            const key = app_configuration_1.default.auth.tokenKey;
            const { token: newToken, expiredAt, errorMessage } = (0, utils_1.stringToToken)(tokenString, key);
            if (expiredAt) {
                (0, error_handling_1.throwCustomException)('Token expired' + (errorMessage ? `: ${errorMessage}` : ''), { expiredAt }, common_1.HttpStatus.REQUEST_TIMEOUT)();
            }
            if (errorMessage) {
                (0, error_handling_1.throwCustomException)('Invalid auth token' + (errorMessage ? `: ${errorMessage}` : ''), undefined, common_1.HttpStatus.FORBIDDEN)();
            }
            token = newToken;
        }
        const identity = await this.tokenToIdentity(token);
        if (!identity) {
            (0, error_handling_1.throwCustomException)('Invalid auth token', undefined, common_1.HttpStatus.FORBIDDEN)();
        }
        request.identity = identity;
        return next.handle();
    }
};
CookieAuthInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository])
], CookieAuthInterceptor);
exports.CookieAuthInterceptor = CookieAuthInterceptor;
//# sourceMappingURL=AuthInterceptor.js.map