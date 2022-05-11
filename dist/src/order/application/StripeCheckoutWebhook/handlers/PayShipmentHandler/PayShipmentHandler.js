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
exports.PayShipmentHandler = void 0;
const common_1 = require("@nestjs/common");
const application_1 = require("../../../../../common/application");
const Order_1 = require("../../../../entity/Order");
const IOrderRepository_1 = require("../../../../persistence/IOrderRepository");
let PayShipmentHandler = class PayShipmentHandler {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute({ port: payShipmentRequest, mongoTransactionSession, }) {
        await this.markOrderPaid(payShipmentRequest, mongoTransactionSession);
    }
    async markOrderPaid({ orderId }, mongoTransactionSession) {
        await this.orderRepository.setProperties({ orderId, status: Order_1.OrderStatus.Finalized }, { status: Order_1.OrderStatus.Paid }, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayShipmentHandler.prototype, "execute", null);
PayShipmentHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository])
], PayShipmentHandler);
exports.PayShipmentHandler = PayShipmentHandler;
//# sourceMappingURL=PayShipmentHandler.js.map