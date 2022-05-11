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
exports.ConfirmOrder = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
const app_configuration_2 = __importDefault(require("../../../../app.configuration"));
const IOrderRepository_1 = require("../../persistence/IOrderRepository");
const application_1 = require("../../../common/application");
const Order_1 = require("../../entity/Order");
const IHostRepository_1 = require("../../../host/persistence/IHostRepository");
const error_handling_1 = require("../../../common/error-handling");
const IStripeCheckoutWebhook_1 = require("../StripeCheckoutWebhook/IStripeCheckoutWebhook");
const ICustomerRepository_1 = require("../../../customer/persistence/ICustomerRepository");
let ConfirmOrder = class ConfirmOrder {
    orderRepository;
    hostRepository;
    customerRepository;
    stripe;
    constructor(orderRepository, hostRepository, customerRepository, stripe) {
        this.orderRepository = orderRepository;
        this.hostRepository = hostRepository;
        this.customerRepository = customerRepository;
        this.stripe = stripe;
    }
    async execute({ port: confirmOrderPayload, mongoTransactionSession, }) {
        const checkoutSession = await this.matchOrderAndCheckout(confirmOrderPayload, mongoTransactionSession);
        return {
            checkoutUrl: checkoutSession.url,
        };
    }
    async matchOrderAndCheckout({ orderId, customerId, balanceDiscountUsdCents }, mongoTransactionSession) {
        const draftOrder = (await this.orderRepository.findOrder({ orderId, status: Order_1.OrderStatus.Drafted, customerId }, mongoTransactionSession));
        const host = await this.findMatchingHost(draftOrder, mongoTransactionSession);
        const { stripeCustomerId, refereeCustomerId, } = await this.customerRepository.findCustomer({ customerId });
        const checkoutSession = await this.createStripeCheckoutSession({
            customerId,
            orderId,
            host,
            stripeCustomerId,
            balanceDiscountUsdCents,
            refereeCustomerId,
        }, mongoTransactionSession);
        return checkoutSession;
    }
    async findMatchingHost({ originCountry }, mongoTransactionSession) {
        try {
            return this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(originCountry, mongoTransactionSession);
        }
        catch (error) {
            console.error(error);
            (0, error_handling_1.throwCustomException)('No available host', { originCountry }, common_1.HttpStatus.SERVICE_UNAVAILABLE)();
        }
    }
    async createStripeCheckoutSession({ customerId, orderId, host, stripeCustomerId, balanceDiscountUsdCents, refereeCustomerId, }, mongoTransactionSession) {
        if (!(await this.verifyBalanceAndDiscount(customerId, balanceDiscountUsdCents, mongoTransactionSession))) {
            return (0, error_handling_1.throwCustomException)(`Not enough balance to apply discount ${balanceDiscountUsdCents /
                100} USD`, { customerId, balanceDiscountUsdCents })();
        }
        const { stripeProductId: serviceFeeProductId, stripePriceId: serviceFeePriceId, loclyCutPercent, } = app_configuration_2.default.serviceFee;
        const percentage = 0.01 * loclyCutPercent;
        const { unit_amount: serviceFeeAmount, currency, } = await this.stripe.prices.retrieve(serviceFeePriceId);
        const loclyFeeAmount = serviceFeeAmount * percentage;
        const match = {
            orderId,
            hostId: host.id,
        };
        let loclyFeeConfig;
        if (loclyFeeAmount > balanceDiscountUsdCents) {
            loclyFeeConfig = {
                application_fee_amount: loclyFeeAmount - balanceDiscountUsdCents,
                transfer_data: { destination: host.stripeAccountId },
            };
        }
        else if (serviceFeeAmount - balanceDiscountUsdCents < 50) {
            balanceDiscountUsdCents = serviceFeeAmount - 50;
        }
        const checkoutSession = (await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: stripeCustomerId,
            line_items: [
                {
                    price_data: {
                        product: serviceFeeProductId,
                        unit_amount: serviceFeeAmount - balanceDiscountUsdCents,
                        currency,
                    },
                    quantity: 1,
                },
            ],
            ...(loclyFeeConfig && { payment_intent_data: loclyFeeConfig }),
            allow_promotion_codes: !Boolean(balanceDiscountUsdCents),
            metadata: {
                feeType: IStripeCheckoutWebhook_1.FeeType.Service,
                ...(balanceDiscountUsdCents && {
                    customerId,
                    balanceDiscountUsdCents,
                }),
                refereeCustomerId,
                ...match,
            },
            mode: 'payment',
            success_url: app_configuration_1.default.stripe.successPageUrl,
            cancel_url: app_configuration_1.default.stripe.cancelPageUrl,
        }));
        return checkoutSession;
    }
    async verifyBalanceAndDiscount(customerId, balanceDiscountUsdCents, mongoTransactionSession) {
        const { balanceUsdCents, } = await this.customerRepository.findCustomer({ customerId }, mongoTransactionSession, true);
        return balanceUsdCents >= balanceDiscountUsdCents;
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfirmOrder.prototype, "execute", null);
ConfirmOrder = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, nestjs_stripe_1.InjectStripeClient)()),
    __metadata("design:paramtypes", [IOrderRepository_1.IOrderRepository,
        IHostRepository_1.IHostRepository,
        ICustomerRepository_1.ICustomerRepository,
        stripe_1.default])
], ConfirmOrder);
exports.ConfirmOrder = ConfirmOrder;
//# sourceMappingURL=ConfirmOrder.js.map