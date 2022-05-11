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
exports.DeleteOrder = void 0;
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const ICustomerRepository_1 = require("../../../customer/persistence/ICustomerRepository");
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const Order_1 = require("../../entity/Order");
let DeleteOrder = class DeleteOrder {
    customerRepository;
    orderRepository;
    constructor(customerRepository, orderRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }
    async execute({ port: deleteOrderPayload, mongoTransactionSession, }) {
        await this.deleteOrder(deleteOrderPayload, mongoTransactionSession);
    }
    async deleteOrder({ orderId, customerId }, mongoTransactionSession) {
        await this.orderRepository.deleteOrder({ orderId, status: Order_1.OrderStatus.Drafted, customerId }, mongoTransactionSession);
        await this.customerRepository.removeOrder({ customerId }, orderId, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeleteOrder.prototype, "execute", null);
DeleteOrder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ICustomerRepository_1.ICustomerRepository,
        IOrderRepository_1.IOrderRepository])
], DeleteOrder);
exports.DeleteOrder = DeleteOrder;
//# sourceMappingURL=DeleteOrder.js.map