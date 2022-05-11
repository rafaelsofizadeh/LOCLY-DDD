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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const nest_mongodb_1 = require("nest-mongodb");
const nestjs_stripe_1 = require("@golevelup/nestjs-stripe");
const nestjs_webhooks_1 = require("@golevelup/nestjs-webhooks");
const app_configuration_1 = __importDefault(require("../app.configuration"));
const OrderModule_1 = require("./order/OrderModule");
const CustomerModule_1 = require("./customer/CustomerModule");
const AuthModule_1 = require("./auth/AuthModule");
const HostModule_1 = require("./host/HostModule");
const ICustomerRepository_1 = require("./customer/persistence/ICustomerRepository");
const CustomerMongoRepositoryAdapter_1 = require("./customer/persistence/CustomerMongoRepositoryAdapter");
const HostMongoRepositoryAdapter_1 = require("./host/persistence/HostMongoRepositoryAdapter");
const IHostRepository_1 = require("./host/persistence/IHostRepository");
const IOrderRepository_1 = require("./order/persistence/IOrderRepository");
const OrderMongoRepositoryAdapter_1 = require("./order/persistence/OrderMongoRepositoryAdapter");
const NotificationModule_1 = require("./infrastructure/notification/NotificationModule");
const { mongo, stripe } = app_configuration_1.default;
const infrastructureModules = [
    nest_mongodb_1.MongoModule.forRoot(mongo.connectionString, mongo.dbName, {
        useUnifiedTopology: true,
    }),
    nest_mongodb_1.MongoModule.forFeature([
        'orders',
        'customers',
        'hosts',
        'host_item_photos.files',
        'host_item_photos.chunks',
        'host_shipment_payment_proofs.files',
        'host_shipment_payment_proofs.chunks',
    ]),
    nestjs_stripe_1.StripeModule.forRoot(nestjs_stripe_1.StripeModule, {
        apiKey: stripe.apiKey,
        apiVersion: stripe.apiVersion,
        webhookConfig: {
            stripeWebhookSecret: stripe.webhook.secret,
        },
    }),
];
const persistenceProviders = [
    {
        provide: ICustomerRepository_1.ICustomerRepository,
        useClass: CustomerMongoRepositoryAdapter_1.CustomerMongoRepositoryAdapter,
    },
    {
        provide: IHostRepository_1.IHostRepository,
        useClass: HostMongoRepositoryAdapter_1.HostMongoRepositoryAdapter,
    },
    { provide: IOrderRepository_1.IOrderRepository, useClass: OrderMongoRepositoryAdapter_1.OrderMongoRepositoryAdapter },
];
let AppModule = class AppModule {
    constructor() { }
    configure(consumer) {
        (0, nestjs_webhooks_1.applyRawBodyOnlyTo)(consumer, {
            method: common_1.RequestMethod.ALL,
            path: stripe.webhook.path,
        });
        consumer.apply((0, cookie_parser_1.default)()).forRoutes('*');
    }
};
AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            ...infrastructureModules,
            NotificationModule_1.NotificationModule,
            AuthModule_1.AuthModule,
            HostModule_1.HostModule,
            CustomerModule_1.CustomerModule,
            OrderModule_1.OrderModule,
            nestjs_webhooks_1.JsonBodyMiddleware,
            nestjs_webhooks_1.RawBodyMiddleware,
        ],
        providers: [...persistenceProviders],
        exports: [...persistenceProviders, ...infrastructureModules],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=AppModule.js.map