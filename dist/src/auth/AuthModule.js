"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const CustomerModule_1 = require("../customer/CustomerModule");
const HostModule_1 = require("../host/HostModule");
const IRequestAuth_1 = require("./application/RequestAuth/IRequestAuth");
const RequestAuth_1 = require("./application/RequestAuth/RequestAuth");
const IVerifyAuth_1 = require("./application/VerifyAuth/IVerifyAuth");
const TokenParamToBodyMiddleware_1 = require("./application/VerifyAuth/TokenParamToBodyMiddleware");
const VerifyAuth_1 = require("./application/VerifyAuth/VerifyAuth");
const AuthController_1 = require("./AuthController");
const AuthInterceptor_1 = require("./infrastructure/AuthInterceptor");
const NotificationModule_1 = require("../infrastructure/notification/NotificationModule");
let AuthModule = class AuthModule {
    configure(consumer) {
        consumer
            .apply(TokenParamToBodyMiddleware_1.VerificationTokenParamToBodyMiddleware)
            .forRoutes({ path: 'auth/:token', method: common_1.RequestMethod.GET });
    }
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [CustomerModule_1.CustomerModule, HostModule_1.HostModule, NotificationModule_1.NotificationModule],
        controllers: [AuthController_1.AuthController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: AuthInterceptor_1.CookieAuthInterceptor,
            },
            { provide: IRequestAuth_1.IRequestAuth, useClass: RequestAuth_1.RequestAuth },
            { provide: IVerifyAuth_1.IVerifyAuth, useClass: VerifyAuth_1.VerifyAuth },
        ],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=AuthModule.js.map