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
exports.RequestAuth = void 0;
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const IGetCustomerUpsert_1 = require("../../../customer/application/GetCustomerUpsert/IGetCustomerUpsert");
const Token_1 = require("../../entity/Token");
const IGetHostUpsert_1 = require("../../../host/application/GetHostUpsert/IGetHostUpsert");
const utils_1 = require("../utils");
const error_handling_1 = require("../../../common/error-handling");
const INotificationService_1 = require("../../../infrastructure/notification/INotificationService");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
let RequestAuth = class RequestAuth {
    getCustomerUpsert;
    getHostUpsert;
    notificationService;
    constructor(getCustomerUpsert, getHostUpsert, notificationService) {
        this.getCustomerUpsert = getCustomerUpsert;
        this.getHostUpsert = getHostUpsert;
        this.notificationService = notificationService;
    }
    async execute({ port: requestAuthPayload, mongoTransactionSession, }) {
        return this.requestAuth(requestAuthPayload, mongoTransactionSession);
    }
    async requestAuth(requestAuthPayload, mongoTransactionSession) {
        const { id: entityId, type: userType } = await this.findOrCreateEntity(requestAuthPayload, mongoTransactionSession);
        const { domain, auth: { tokenKey: key, verificationTokenExpiration: expiresIn }, } = app_configuration_1.default;
        const tokenString = (0, utils_1.tokenToString)({ id: entityId, type: userType, isVerification: true }, key, expiresIn);
        await this.notificationService.notify(requestAuthPayload.email, INotificationService_1.NotificationType.Auth, {
            domain,
            token: tokenString,
        });
        return tokenString;
    }
    async findOrCreateEntity({ email, type: userType, country }, mongoTransactionSession) {
        if (userType === Token_1.UserType.Customer) {
            const { customer } = await this.getCustomerUpsert.execute({
                port: { email },
                mongoTransactionSession,
            });
            return {
                id: customer.id,
                type: Token_1.UserType.Customer,
            };
        }
        if (userType === Token_1.UserType.Host) {
            const { host } = await this.getHostUpsert.execute({
                port: { email, ...(country && { country }) },
                mongoTransactionSession,
            });
            return {
                id: host.id,
                type: Token_1.UserType.Host,
            };
        }
        (0, error_handling_1.throwCustomException)('Incorrect entity type', { userType })();
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestAuth.prototype, "execute", null);
RequestAuth = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IGetCustomerUpsert_1.IGetCustomerUpsert,
        IGetHostUpsert_1.IGetHostUpsert,
        INotificationService_1.INotificationService])
], RequestAuth);
exports.RequestAuth = RequestAuth;
//# sourceMappingURL=RequestAuth.js.map