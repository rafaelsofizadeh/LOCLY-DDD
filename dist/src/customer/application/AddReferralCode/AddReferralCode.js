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
exports.AddReferralCode = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
const application_1 = require("../../../common/application");
const error_handling_1 = require("../../../common/error-handling");
const ICustomerRepository_1 = require("../../../customer/persistence/ICustomerRepository");
const IAddReferralCode_1 = require("./IAddReferralCode");
let AddReferralCode = class AddReferralCode extends IAddReferralCode_1.IAddReferralCode {
    customerRepository;
    constructor(customerRepository) {
        super();
        this.customerRepository = customerRepository;
    }
    async execute({ port: addReferralCodePayload, mongoTransactionSession, }) {
        await this.addReferralCode(addReferralCodePayload, mongoTransactionSession);
    }
    async addReferralCode({ customerId, refereeCode }, mongoTransactionSession) {
        if (!refereeCode) {
            return;
        }
        const { refereeCustomerId: existingRefereeId, orderIds, referralCode, } = await this.customerRepository.findCustomer({ customerId }, mongoTransactionSession, true);
        if (referralCode === refereeCode) {
            return (0, error_handling_1.throwCustomException)("Can't refer yourself", {
                customerId,
                refereeCode,
                referralCode,
            }, common_1.HttpStatus.FORBIDDEN)();
        }
        if (existingRefereeId) {
            return (0, error_handling_1.throwCustomException)('Customer has already been referred', {
                customerId,
                existingRefereeId,
            }, common_1.HttpStatus.FORBIDDEN)();
        }
        if (orderIds.length) {
            return (0, error_handling_1.throwCustomException)('Only first-time customers can be referred', {
                customerId,
            }, common_1.HttpStatus.FORBIDDEN)();
        }
        const { id: refereeCustomerId, } = await this.customerRepository.findCustomer({ referralCode: refereeCode }, mongoTransactionSession);
        await this.customerRepository.setProperties({ customerId }, { refereeCustomerId }, mongoTransactionSession);
        const refereeRewardUsdCents = Number(app_configuration_1.default.rewards.refereeUsd) * 100;
        await this.customerRepository.updateBalance({ customerId }, refereeRewardUsdCents, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddReferralCode.prototype, "execute", null);
AddReferralCode = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ICustomerRepository_1.ICustomerRepository])
], AddReferralCode);
exports.AddReferralCode = AddReferralCode;
//# sourceMappingURL=AddReferralCode.js.map