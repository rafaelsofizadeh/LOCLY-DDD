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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayShipmentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const application_1 = require("../../../common/application");
const Order_1 = require("../../entity/Order");
const IStripeCheckoutWebhook_1 = require("../StripeCheckoutWebhook/IStripeCheckoutWebhook");
const ICustomerRepository_1 = require("../../../customer/persistence/ICustomerRepository");
const IHostRepository_1 = require("../../../host/persistence/IHostRepository");
let PayShipmentService = class PayShipmentService {
    orderRepository;
    customerRepository;
    hostRepository;
    stripe;
    constructor(orderRepository, customerRepository, hostRepository, stripe) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.hostRepository = hostRepository;
        this.stripe = stripe;
    }
    async execute({ port: payShipmentPayload, mongoTransactionSession, }) {
        const checkoutSession = await this.createPaymentSession(payShipmentPayload, mongoTransactionSession);
        return {
            checkoutUrl: checkoutSession.url,
        };
    }
    async createPaymentSession({ orderId, customerId }, mongoTransactionSession) {
        const { finalShipmentCost: finalShipmentCostPreFee, hostId, } = await this.orderRepository.findOrder({ orderId, status: Order_1.OrderStatus.Finalized, customerId }, mongoTransactionSession);
        const finalShipmentCost = {
            ...finalShipmentCostPreFee,
            amount: Math.ceil(finalShipmentCostPreFee.amount / ((100 - 2.9) / 100)) + 0.3,
        };
        const { stripeCustomerId, } = await this.customerRepository.findCustomer({ customerId });
        const { stripeAccountId: hostStripeAccountId, } = await this.hostRepository.findHost({
            hostId,
        });
        const finalShipmentCostStripe = (0, application_1.stripePrice)(finalShipmentCost);
        const stripeApplicationFeeAmount = finalShipmentCostStripe.unit_amount -
            (0, application_1.stripePrice)(finalShipmentCostPreFee).unit_amount;
        const checkoutSession = (await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: stripeCustomerId,
            line_items: [
                {
                    price_data: {
                        ...finalShipmentCostStripe,
                        product_data: {
                            name: 'Order Shipment Fee',
                        },
                    },
                    quantity: 1,
                },
            ],
            allow_promotion_codes: false,
            payment_intent_data: {
                application_fee_amount: stripeApplicationFeeAmount,
                transfer_data: { destination: hostStripeAccountId },
            },
            metadata: {
                feeType: IStripeCheckoutWebhook_1.FeeType.Shipment,
                orderId,
            },
            mode: 'payment',
            success_url: app_configuration_1.default.stripe.successPageUrl,
            cancel_url: app_configuration_1.default.stripe.cancelPageUrl,
        }));
        return checkoutSession;
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayShipmentService.prototype, "execute", null);
PayShipmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, nestjs_stripe_1.InjectStripeClient)()),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository,
        ICustomerRepository_1.ICustomerRepository,
        IHostRepository_1.IHostRepository,
        stripe_1.default])
], PayShipmentService);
exports.PayShipmentService = PayShipmentService;
//# sourceMappingURL=PayShipment.js.map