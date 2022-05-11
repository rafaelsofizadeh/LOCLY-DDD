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
exports.CreateCustomer = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
const ICustomerRepository_1 = require("../../persistence/ICustomerRepository");
const application_1 = require("../../../common/application");
const domain_1 = require("../../../common/domain");
const ICreateCustomer_1 = require("./ICreateCustomer");
let CreateCustomer = class CreateCustomer extends ICreateCustomer_1.ICreateCustomer {
    customerRepository;
    stripe;
    constructor(customerRepository, stripe) {
        super();
        this.customerRepository = customerRepository;
        this.stripe = stripe;
    }
    async execute({ port: createCustomerPayload, mongoTransactionSession, }) {
        return this.createCustomer(createCustomerPayload, mongoTransactionSession);
    }
    async createCustomer({ email }, mongoTransactionSession) {
        const { id: stripeCustomerId, } = await this.stripe.customers.create({
            email,
        });
        const customer = {
            id: (0, domain_1.UUID)(),
            email,
            stripeCustomerId,
            balanceUsdCents: 0,
            referralCode: this.referralCode(),
            orderIds: [],
            addresses: [],
        };
        await this.customerRepository.addCustomer(customer, mongoTransactionSession);
        return customer;
    }
    referralCode() {
        const length = Number(app_configuration_1.default.rewards.codeLength);
        return Math.random()
            .toString(36)
            .slice(2, 2 + length);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateCustomer.prototype, "execute", null);
CreateCustomer = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_stripe_1.InjectStripeClient)()),
    __metadata("design:paramtypes", [ICustomerRepository_1.ICustomerRepository,
        stripe_1.default])
], CreateCustomer);
exports.CreateCustomer = CreateCustomer;
//# sourceMappingURL=CreateCustomer.js.map