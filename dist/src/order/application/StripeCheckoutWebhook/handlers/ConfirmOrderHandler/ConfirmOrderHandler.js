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
exports.ConfirmOrderHandler = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../../../../../app.configuration"));
const application_1 = require("../../../../../common/application");
const Order_1 = require("../../../../entity/Order");
const IHostRepository_1 = require("../../../../../host/persistence/IHostRepository");
const IOrderRepository_1 = require("../../../../../order/persistence/IOrderRepository");
const ICustomerRepository_1 = require("../../../../../customer/persistence/ICustomerRepository");
let ConfirmOrderHandler = class ConfirmOrderHandler {
    orderRepository;
    customerRepository;
    hostRepository;
    constructor(orderRepository, customerRepository, hostRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.hostRepository = hostRepository;
    }
    async execute({ port: confirmOrderRequest, mongoTransactionSession, }) {
        const matchedHostAddress = await this.confirmOrder(confirmOrderRequest, mongoTransactionSession);
        await this.referralReward(confirmOrderRequest, mongoTransactionSession);
        await this.updateBalanceAfterDiscount(confirmOrderRequest, mongoTransactionSession);
        return { address: matchedHostAddress };
    }
    async confirmOrder({ orderId, hostId }, mongoTransactionSession) {
        const { address: hostAddress } = await this.hostRepository.findHost({ hostId }, mongoTransactionSession);
        await this.orderRepository.setProperties({ orderId, status: Order_1.OrderStatus.Drafted }, { status: Order_1.OrderStatus.Confirmed, hostId, hostAddress }, mongoTransactionSession);
        await this.hostRepository.addOrderToHost({ hostId }, orderId, mongoTransactionSession);
        return hostAddress;
    }
    async updateBalanceAfterDiscount({ customerId, balanceDiscountUsdCents }, mongoTransactionSession) {
        await this.customerRepository.updateBalance({ customerId }, -balanceDiscountUsdCents, mongoTransactionSession);
    }
    async referralReward({ refereeCustomerId }, mongoTransactionSession) {
        const referralRewardUsdCents = app_configuration_1.default.rewards.referralUsd * 100;
        await this.customerRepository.updateBalance({ customerId: refereeCustomerId }, referralRewardUsdCents, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfirmOrderHandler.prototype, "execute", null);
ConfirmOrderHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository,
        ICustomerRepository_1.ICustomerRepository,
        IHostRepository_1.IHostRepository])
], ConfirmOrderHandler);
exports.ConfirmOrderHandler = ConfirmOrderHandler;
//# sourceMappingURL=ConfirmOrderHandler.js.map