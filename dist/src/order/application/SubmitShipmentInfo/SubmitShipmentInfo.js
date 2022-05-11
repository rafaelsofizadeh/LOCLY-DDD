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
exports.SubmitShipmentInfo = void 0;
const common_1 = require("@nestjs/common");
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const application_1 = require("../../../common/application");
const Order_1 = require("../../entity/Order");
const error_handling_1 = require("../../../common/error-handling");
var UnfinalizedItemReason;
(function (UnfinalizedItemReason) {
    UnfinalizedItemReason["NO_PHOTOS"] = "no photos";
    UnfinalizedItemReason["NOT_RECEIVED"] = "not received";
})(UnfinalizedItemReason || (UnfinalizedItemReason = {}));
let SubmitShipmentInfo = class SubmitShipmentInfo {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute({ port: finalizeOrderRequest, mongoTransactionSession, }) {
        const proofOfPaymentUpload = await this.finalizeOrder(finalizeOrderRequest, mongoTransactionSession);
        return proofOfPaymentUpload;
    }
    async finalizeOrder({ orderId, hostId, totalWeight, shipmentCost: finalShipmentCost, calculatorResultUrl, trackingNumber, deliveryEstimateDays, proofOfPayment, }, mongoTransactionSession) {
        const unfinalizedItems = await this.getUnfinalizedItems(orderId, hostId);
        if (unfinalizedItems.length) {
            (0, error_handling_1.throwCustomException)("Can't finalize order until all items have uploaded photos and have been marked as 'received'", { orderId, unfinalizedItems }, common_1.HttpStatus.FORBIDDEN)();
        }
        await this.orderRepository.setProperties({ orderId }, {
            totalWeight,
            finalShipmentCost,
            status: Order_1.OrderStatus.Finalized,
            ...(calculatorResultUrl && { calculatorResultUrl }),
            ...(trackingNumber && { trackingNumber }),
            ...(deliveryEstimateDays && { deliveryEstimateDays }),
        }, mongoTransactionSession);
        return this.orderRepository.addFile({ orderId }, proofOfPayment, mongoTransactionSession);
    }
    async getUnfinalizedItems(orderId, hostId) {
        const order = await this.orderRepository.findOrder({
            orderId,
            status: [Order_1.OrderStatus.Confirmed, Order_1.OrderStatus.Finalized],
            hostId,
        });
        const unfinalizedItems = order.items
            .map(({ id, receivedDate, photoIds }) => {
            const reasons = [];
            if (!receivedDate) {
                reasons.push(UnfinalizedItemReason.NOT_RECEIVED);
            }
            if (!photoIds?.length) {
                reasons.push(UnfinalizedItemReason.NO_PHOTOS);
            }
            return reasons.length ? { id, reasons } : undefined;
        })
            .filter(unfinalizedItem => Boolean(unfinalizedItem));
        return unfinalizedItems;
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubmitShipmentInfo.prototype, "execute", null);
SubmitShipmentInfo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository])
], SubmitShipmentInfo);
exports.SubmitShipmentInfo = SubmitShipmentInfo;
//# sourceMappingURL=SubmitShipmentInfo.js.map