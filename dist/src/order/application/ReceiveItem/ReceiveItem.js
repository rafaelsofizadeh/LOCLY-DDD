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
exports.ReceiveItem = void 0;
const common_1 = require("@nestjs/common");
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const application_1 = require("../../../common/application");
const Order_1 = require("../../entity/Order");
const error_handling_1 = require("../../../common/error-handling");
let ReceiveItem = class ReceiveItem {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute({ port: { orderId, itemId, hostId }, mongoTransactionSession, }) {
        const receivedDate = await this.handleOrderItemReceipt(orderId, hostId, itemId, mongoTransactionSession);
        return {
            receivedDate,
        };
    }
    async handleOrderItemReceipt(orderId, hostId, itemId, mongoTransactionSession) {
        const receivedDate = new Date();
        const order = await this.orderRepository.findOrder({
            orderId,
            status: Order_1.OrderStatus.Confirmed,
            hostId,
        });
        if (order.items.find(({ id }) => id === itemId).receivedDate) {
            (0, error_handling_1.throwCustomException)("Item already marked as 'received'.", { orderId, itemId }, common_1.HttpStatus.NOT_ACCEPTABLE)();
        }
        await this.orderRepository.setItemProperties({ orderId }, {
            itemId,
            receivedDate: null,
        }, { receivedDate }, mongoTransactionSession);
        return receivedDate;
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceiveItem.prototype, "execute", null);
ReceiveItem = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository])
], ReceiveItem);
exports.ReceiveItem = ReceiveItem;
//# sourceMappingURL=ReceiveItem.js.map