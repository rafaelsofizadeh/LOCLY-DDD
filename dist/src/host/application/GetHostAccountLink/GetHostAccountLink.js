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
exports.GetHostAccountLink = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const error_handling_1 = require("../../../common/error-handling");
let GetHostAccountLink = class GetHostAccountLink {
    stripe;
    constructor(stripe) {
        this.stripe = stripe;
    }
    async execute({ port, }) {
        return this.generateHostStripeAccountLink(port);
    }
    async generateHostStripeAccountLink({ stripeAccountId, }) {
        try {
            const { details_submitted: detailsSubmitted, } = await this.stripe.accounts.retrieve(stripeAccountId);
            if (detailsSubmitted) {
                const { url } = await this.stripe.accounts.createLoginLink(stripeAccountId);
                return { url };
            }
            const { expires_at, url } = await this.stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: 'https://example.com',
                return_url: 'https://example.com',
                type: 'account_onboarding',
            });
            return {
                url,
                expiresAt: new Date(expires_at * 1000),
            };
        }
        catch (stripeError) {
            (0, error_handling_1.throwCustomException)('Unexpected Stripe account error')(stripeError);
        }
    }
};
GetHostAccountLink = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_stripe_1.InjectStripeClient)()),
    __metadata("design:paramtypes", [stripe_1.default])
], GetHostAccountLink);
exports.GetHostAccountLink = GetHostAccountLink;
//# sourceMappingURL=GetHostAccountLink.js.map