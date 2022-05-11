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
exports.DraftOrder = void 0;
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const ICustomerRepository_1 = require("../../../customer/persistence/ICustomerRepository");
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const getShipmentCostQuote_1 = require("../../../calculator/getShipmentCostQuote");
const domain_1 = require("../../../common/domain");
const Order_1 = require("../../entity/Order");
let DraftOrder = class DraftOrder {
    customerRepository;
    orderRepository;
    constructor(customerRepository, orderRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }
    async execute({ port: draftOrderPayload, mongoTransactionSession, }) {
        return this.draftOrder(draftOrderPayload, mongoTransactionSession);
    }
    async draftOrder(draftOrderPayload, mongoTransactionSession) {
        const draftOrder = this.constructDraftOrder(draftOrderPayload);
        await this.orderRepository.addOrder(draftOrder, mongoTransactionSession);
        await this.customerRepository.addOrder({ customerId: draftOrder.customerId }, draftOrder.id, mongoTransactionSession);
        return draftOrder;
    }
    constructDraftOrder({ customerId, originCountry, items: itemsWithoutId, destination, }) {
        const items = itemsWithoutId.map(itemWithoutId => ({
            ...itemWithoutId,
            id: (0, domain_1.UUID)(),
        }));
        const initialShipmentCost = this.approximateShipmentCost(originCountry, destination, items, getShipmentCostQuote_1.getShipmentCostQuote);
        return {
            id: (0, domain_1.UUID)(),
            status: Order_1.OrderStatus.Drafted,
            customerId,
            items,
            originCountry,
            destination,
            initialShipmentCost,
        };
    }
    approximateShipmentCost(originCountry, { country: destinationCountry }, items, getShipmentCostQuote) {
        const { currency, services } = getShipmentCostQuote(originCountry, destinationCountry, items.reduce((totalWeight, { weight }) => totalWeight + weight, 0));
        const { price: amount } = services[0];
        return { amount, currency };
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DraftOrder.prototype, "execute", null);
DraftOrder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ICustomerRepository_1.ICustomerRepository,
        IOrderRepository_1.IOrderRepository])
], DraftOrder);
exports.DraftOrder = DraftOrder;
//# sourceMappingURL=DraftOrder.js.map