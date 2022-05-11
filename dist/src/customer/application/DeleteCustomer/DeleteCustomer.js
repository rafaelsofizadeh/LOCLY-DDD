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
exports.DeleteCustomer = void 0;
const IOrderRepository_1 = require("../../../order/persistence/IOrderRepository");
const ICustomerRepository_1 = require("../../../customer/persistence/ICustomerRepository");
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const Order_1 = require("../../../order/entity/Order");
const error_handling_1 = require("../../../common/error-handling");
let DeleteCustomer = class DeleteCustomer {
    customerRepository;
    orderRepository;
    constructor(customerRepository, orderRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }
    async execute({ port: deleteCustomerPayload, mongoTransactionSession, }) {
        await this.deleteCustomer(deleteCustomerPayload, mongoTransactionSession);
    }
    async deleteCustomer({ customerId }, mongoTransactionSession) {
        const { orderIds } = await this.customerRepository.findCustomer({ customerId }, mongoTransactionSession);
        const orders = await this.orderRepository.findOrders(orderIds, mongoTransactionSession);
        const draftedOrders = orders.filter(({ status }) => status === Order_1.OrderStatus.Drafted);
        const completedOrders = orders.filter(({ status }) => status === Order_1.OrderStatus.Completed);
        const ordersInProgress = draftedOrders.concat(completedOrders);
        if (ordersInProgress.length !== orders.length) {
            (0, error_handling_1.throwCustomException)('Customer has orders still in progress. Wait for the orders to complete and be delivered to the customer to delete the customer account.', {
                ordersInProgress: ordersInProgress.map(({ id }) => id),
            });
        }
        await this.customerRepository.deleteCustomer({ customerId }, mongoTransactionSession);
        await this.orderRepository.deleteOrders(draftedOrders.map(({ id }) => id), mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeleteCustomer.prototype, "execute", null);
DeleteCustomer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ICustomerRepository_1.ICustomerRepository,
        IOrderRepository_1.IOrderRepository])
], DeleteCustomer);
exports.DeleteCustomer = DeleteCustomer;
//# sourceMappingURL=DeleteCustomer.js.map