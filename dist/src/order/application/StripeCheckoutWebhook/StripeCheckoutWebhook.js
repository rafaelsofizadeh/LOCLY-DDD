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
exports.StripeCheckoutWebhook = void 0;
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const common_1 = require("@nestjs/common");
const error_handling_1 = require("../../../common/error-handling");
const IConfirmOrderHandler_1 = require("./handlers/ConfirmOrderHandler/IConfirmOrderHandler");
const IPayShipmentHandler_1 = require("./handlers/PayShipmentHandler/IPayShipmentHandler");
const IStripeCheckoutWebhook_1 = require("./IStripeCheckoutWebhook");
let StripeCheckoutWebhook = class StripeCheckoutWebhook {
    confirmOrderWebhookGateway;
    payShipmentWebhookGateway;
    constructor(confirmOrderWebhookGateway, payShipmentWebhookGateway) {
        this.confirmOrderWebhookGateway = confirmOrderWebhookGateway;
        this.payShipmentWebhookGateway = payShipmentWebhookGateway;
    }
    async execute(event) {
        const session = event.data.object;
        const webhookPayload = session.metadata;
        switch (webhookPayload.feeType) {
            case IStripeCheckoutWebhook_1.FeeType.Service:
                await this.confirmOrderWebhookGateway.execute({
                    port: webhookPayload,
                });
                break;
            case IStripeCheckoutWebhook_1.FeeType.Shipment:
                await this.payShipmentWebhookGateway.execute({
                    port: webhookPayload,
                });
                break;
            default:
                (0, error_handling_1.throwCustomException)("Unexpected Stripe 'checkout.session.completed' webhook type", { webhookPayload })();
        }
        return;
    }
};
__decorate([
    (0, nestjs_stripe_1.StripeWebhookHandler)('checkout.session.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeCheckoutWebhook.prototype, "execute", null);
StripeCheckoutWebhook = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IConfirmOrderHandler_1.IConfirmOrderHandler,
        IPayShipmentHandler_1.IPayShipmentHandler])
], StripeCheckoutWebhook);
exports.StripeCheckoutWebhook = StripeCheckoutWebhook;
//# sourceMappingURL=StripeCheckoutWebhook.js.map