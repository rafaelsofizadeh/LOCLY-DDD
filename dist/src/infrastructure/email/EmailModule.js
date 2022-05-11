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
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_1 = __importDefault(require("../../../app.configuration"));
const IEmailService_1 = require("./IEmailService");
const EtherealPseudoEmailService_1 = require("./EtherealPseudoEmailService");
const providers = [
    {
        provide: IEmailService_1.IEmailService,
        useFactory: () => {
            switch (app_configuration_1.default.email.service) {
                case 'mailchimp':
                    return new EtherealPseudoEmailService_1.EtherealPseudoEmailService();
                case 'ethereal':
                    return new EtherealPseudoEmailService_1.EtherealPseudoEmailService();
                default:
                    console.log('No email service specified. Falling back to default Ethereal for emails.');
                    return new EtherealPseudoEmailService_1.EtherealPseudoEmailService();
            }
        },
    },
];
let EmailModule = class EmailModule {
};
EmailModule = __decorate([
    (0, common_1.Module)({ providers, exports: providers })
], EmailModule);
exports.EmailModule = EmailModule;
//# sourceMappingURL=EmailModule.js.map