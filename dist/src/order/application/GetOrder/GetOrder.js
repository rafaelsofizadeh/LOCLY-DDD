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
exports.GetOrder = void 0;
const common_1 = require("@nestjs/common");
const Token_1 = require("../../../auth/entity/Token");
const application_1 = require("../../../common/application");
const error_handling_1 = require("../../../common/error-handling");
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
let GetOrder = class GetOrder {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute({ port: { orderId, userId, userType }, mongoTransactionSession, }) {
        const orderFilter = {
            orderId,
        };
        let orderLens;
        try {
            if (userType === Token_1.UserType.Customer) {
                orderFilter.customerId = userId;
                orderLens = ({ hostId, ...serializedOrder }) => serializedOrder;
            }
            if (userType === Token_1.UserType.Host) {
                orderFilter.hostId = userId;
                orderLens = ({ customerId, initialShipmentCost, ...serializedOrder }) => serializedOrder;
            }
            const order = await this.orderRepository.findOrder(orderFilter, mongoTransactionSession);
            return orderLens(order);
        }
        catch (error) {
            (0, error_handling_1.throwCustomException)('Order not found.', { orderId, ...orderFilter }, common_1.HttpStatus.NOT_FOUND)(error);
        }
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetOrder.prototype, "execute", null);
GetOrder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository])
], GetOrder);
exports.GetOrder = GetOrder;
//# sourceMappingURL=GetOrder.js.map