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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHostAccountHandler = void 0;
const common_1 = require("@nestjs/common");
const application_1 = require("../../../../../common/application");
const IHostRepository_1 = require("../../../../persistence/IHostRepository");
let UpdateHostAccountHandler = class UpdateHostAccountHandler {
    hostRepository;
    constructor(hostRepository) {
        this.hostRepository = hostRepository;
    }
    async execute({ port: updateHostAccountPayload, mongoTransactionSession, }) {
        await this.updateHostAccount(updateHostAccountPayload, mongoTransactionSession);
    }
    async updateHostAccount(hostStripeAccount, mongoTransactionSession) {
        const verified = this.isHostVerified(hostStripeAccount);
        await this.hostRepository.setProperties({ stripeAccountId: hostStripeAccount.id }, {
            verified,
            ...(!verified && { available: false }),
        }, mongoTransactionSession);
    }
    isHostVerified({ charges_enabled, payouts_enabled, details_submitted, requirements, capabilities, }) {
        return (charges_enabled &&
            payouts_enabled &&
            details_submitted &&
            (requirements
                ? !requirements.currently_due || requirements.currently_due.length === 0
                : true) &&
            !requirements?.disabled_reason &&
            capabilities.transfers === 'active');
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UpdateHostAccountHandler.prototype, "execute", null);
UpdateHostAccountHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository])
], UpdateHostAccountHandler);
exports.UpdateHostAccountHandler = UpdateHostAccountHandler;
//# sourceMappingURL=UpdateHostAccountHandler.js.map