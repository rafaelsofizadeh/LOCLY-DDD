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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const ms_1 = __importDefault(require("ms"));
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../app.configuration"));
const IRequestAuth_1 = require("./application/RequestAuth/IRequestAuth");
const IVerifyAuth_1 = require("./application/VerifyAuth/IVerifyAuth");
const IdentityDecorator_1 = require("./infrastructure/IdentityDecorator");
let AuthController = class AuthController {
    requestAuth;
    verifyAuth;
    tokenCookieConfig;
    authCookieConfig;
    constructor(requestAuth, verifyAuth) {
        this.requestAuth = requestAuth;
        this.verifyAuth = verifyAuth;
        const maxAge = (0, ms_1.default)(app_configuration_1.default.cookie.tokenExpiration);
        const cookieConfig = {
            maxAge,
            ...app_configuration_1.default.cookie.cors,
        };
        this.authCookieConfig = {
            ...cookieConfig,
            httpOnly: false,
        };
        this.tokenCookieConfig = {
            ...cookieConfig,
            httpOnly: true,
        };
    }
    async requestAuthHandler(requestAuthRequest, identity) {
        await this.requestAuth.execute({ port: requestAuthRequest });
    }
    async verifyAuthHandler(response, verificationToken) {
        const tokenString = this.verifyAuth.execute(verificationToken);
        response.cookie(app_configuration_1.default.cookie.tokenName, tokenString, this.tokenCookieConfig);
        response.cookie(app_configuration_1.default.cookie.authIndicatorName, true, this.authCookieConfig);
        return response.redirect('https://locly.netlify.app/auth/success');
    }
    async logoutHandler(response) {
        response.clearCookie(app_configuration_1.default.cookie.tokenName, this.tokenCookieConfig);
        response.cookie(app_configuration_1.default.cookie.authIndicatorName, false, {
            ...this.authCookieConfig,
            maxAge: 365 * 24 * 60 * 60 * 10,
        });
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.AnonymousIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IRequestAuth_1.RequestAuthRequest, void 0]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestAuthHandler", null);
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, IdentityDecorator_1.VerificationTokenIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyAuthHandler", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutHandler", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [IRequestAuth_1.IRequestAuth,
        IVerifyAuth_1.IVerifyAuth])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map