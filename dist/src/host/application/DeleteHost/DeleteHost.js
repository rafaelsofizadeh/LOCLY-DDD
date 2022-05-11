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
exports.DeleteHost = void 0;
const IOrderRepository_1 = require("../../../order/persistence/IOrderRepository");
const IHostRepository_1 = require("../../../host/persistence/IHostRepository");
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const Order_1 = require("../../../order/entity/Order");
const error_handling_1 = require("../../../common/error-handling");
let DeleteHost = class DeleteHost {
    hostRepository;
    orderRepository;
    constructor(hostRepository, orderRepository) {
        this.hostRepository = hostRepository;
        this.orderRepository = orderRepository;
    }
    async execute({ port: deleteHostPayload, mongoTransactionSession, }) {
        await this.deleteHost(deleteHostPayload, mongoTransactionSession);
    }
    async deleteHost({ hostId }, mongoTransactionSession) {
        const { orderIds } = await this.hostRepository.findHost({ hostId }, mongoTransactionSession);
        const orders = await this.orderRepository.findOrders(orderIds, mongoTransactionSession);
        const ordersInProgress = orders.filter(({ status }) => status === Order_1.OrderStatus.Completed);
        if (ordersInProgress.length !== orders.length) {
            (0, error_handling_1.throwCustomException)('Host has orders still in progress. Wait for the orders to complete and be delivered to the customer to delete the host account.', {
                ordersInProgress: ordersInProgress.map(({ id }) => id),
            });
        }
        await this.hostRepository.deleteHost({ hostId }, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeleteHost.prototype, "execute", null);
DeleteHost = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository,
        IOrderRepository_1.IOrderRepository])
], DeleteHost);
exports.DeleteHost = DeleteHost;
//# sourceMappingURL=DeleteHost.js.map