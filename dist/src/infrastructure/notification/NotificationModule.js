"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../../app.configuration"));
const EmailModule_1 = require("../email/EmailModule");
const INotificationService_1 = require("./INotificationService");
const EmailNotificationService_1 = require("./EmailNotificationService");
const IEmailService_1 = require("../email/IEmailService");
const ConsoleNotificationService_1 = require("./ConsoleNotificationService");
const providers = [
    {
        provide: INotificationService_1.INotificationService,
        useFactory: async (emailService) => {
            const { nodeEnv } = app_configuration_1.default;
            switch (nodeEnv) {
                case 'dev':
                    return new ConsoleNotificationService_1.ConsoleNotificationService();
                case 'prod':
                    return new EmailNotificationService_1.EmailNotificationService(emailService);
                default:
                    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
            }
        },
        inject: [IEmailService_1.IEmailService],
    },
];
let NotificationModule = class NotificationModule {
};
NotificationModule = __decorate([
    (0, common_1.Module)({ imports: [EmailModule_1.EmailModule], providers, exports: providers })
], NotificationModule);
exports.NotificationModule = NotificationModule;
//# sourceMappingURL=NotificationModule.js.map