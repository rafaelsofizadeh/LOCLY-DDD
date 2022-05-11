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
exports.CreateHost = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const i18n_iso_countries_1 = require("i18n-iso-countries");
const app_configuration_1 = __importDefault(require("../../../../app.configuration"));
const IHostRepository_1 = require("../../../host/persistence/IHostRepository");
const application_1 = require("../../../common/application");
const domain_1 = require("../../../common/domain");
const error_handling_1 = require("../../../common/error-handling");
let CreateHost = class CreateHost {
    hostRepository;
    stripe;
    stripeSupportedCountries = [
        'ARG',
        'AUS',
        'AUT',
        'BEL',
        'BOL',
        'BGR',
        'CAN',
        'CHL',
        'COL',
        'CRI',
        'HRV',
        'CYP',
        'CZE',
        'DNK',
        'DOM',
        'EGY',
        'EST',
        'FIN',
        'FRA',
        'DEU',
        'GRC',
        'HKG',
        'HUN',
        'ISL',
        'IND',
        'IDN',
        'IRL',
        'ISR',
        'ITA',
        'LVA',
        'LIE',
        'LTU',
        'LUX',
        'MLT',
        'MEX',
        'NLD',
        'NZL',
        'NOR',
        'PRY',
        'PER',
        'POL',
        'PRT',
        'ROU',
        'SGP',
        'SVK',
        'SVN',
        'ESP',
        'SWE',
        'CHE',
        'THA',
        'TTO',
        'GBR',
        'URY',
        'USA',
    ];
    constructor(hostRepository, stripe) {
        this.hostRepository = hostRepository;
        this.stripe = stripe;
    }
    async execute({ port: createHostPayload, mongoTransactionSession, }) {
        return this.createHost(createHostPayload, mongoTransactionSession);
    }
    async createHost({ email, country }, mongoTransactionSession) {
        if (!this.stripeSupportedCountries.includes(country)) {
            (0, error_handling_1.throwCustomException)(`Host can't be based in ${country}. Stripe doesn't support cross-border payouts in ${country}. https://stripe.com/docs/connect/cross-border-payouts`, { country })();
        }
        const hostAccount = await this.createHostStripeAccount({
            email,
            country,
        });
        const host = {
            id: (0, domain_1.UUID)(),
            email,
            country,
            firstName: undefined,
            lastName: undefined,
            address: {},
            orderIds: [],
            stripeAccountId: hostAccount.id,
            available: false,
            verified: false,
            profileComplete: false,
        };
        await this.hostRepository.addHost(host, mongoTransactionSession);
        return host;
    }
    async createHostStripeAccount({ email, country, }) {
        return this.stripe.accounts.create({
            type: 'express',
            email,
            country: (0, i18n_iso_countries_1.alpha3ToAlpha2)(country),
            capabilities: {
                transfers: { requested: true },
            },
            business_type: 'individual',
            tos_acceptance: {
                service_agreement: 'recipient',
            },
            settings: {
                payouts: {
                    schedule: {
                        delay_days: app_configuration_1.default.host.payoutDelayDays,
                        interval: 'daily',
                    },
                },
            },
        });
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateHost.prototype, "execute", null);
CreateHost = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_stripe_1.InjectStripeClient)()),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository,
        stripe_1.default])
], CreateHost);
exports.CreateHost = CreateHost;
//# sourceMappingURL=CreateHost.js.map