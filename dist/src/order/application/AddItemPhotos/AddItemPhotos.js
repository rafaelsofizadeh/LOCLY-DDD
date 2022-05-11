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
exports.AddItemPhotos = void 0;
const common_1 = require("@nestjs/common");
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const application_1 = require("../../../common/application");
const Order_1 = require("../../entity/Order");
const error_handling_1 = require("../../../common/error-handling");
let AddItemPhotos = class AddItemPhotos {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute({ port: addItemPhotoPayload, mongoTransactionSession, }) {
        const itemPhotoUploadResults = await this.uploadItemPhoto(addItemPhotoPayload, mongoTransactionSession);
        return itemPhotoUploadResults;
    }
    async uploadItemPhoto({ orderId, hostId, itemId, photos }, mongoTransactionSession) {
        const order = await this.orderRepository.findOrder({
            orderId,
            status: [Order_1.OrderStatus.Confirmed, Order_1.OrderStatus.Finalized],
            hostId,
        }, mongoTransactionSession);
        const item = order.items.find(({ id }) => id === itemId);
        if (!item.receivedDate) {
            (0, error_handling_1.throwCustomException)('Item should be marked as received before uploading photos.', { orderId, itemId }, common_1.HttpStatus.FORBIDDEN)();
        }
        return this.orderRepository.addItemPhotos({ orderId }, { itemId }, photos, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddItemPhotos.prototype, "execute", null);
AddItemPhotos = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository])
], AddItemPhotos);
exports.AddItemPhotos = AddItemPhotos;
//# sourceMappingURL=AddItemPhotos.js.map