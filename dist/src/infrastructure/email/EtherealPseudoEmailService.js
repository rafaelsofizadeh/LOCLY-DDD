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
exports.EtherealPseudoEmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = require("nodemailer");
const app_configuration_1 = __importDefault(require("../../../app.configuration"));
const error_handling_1 = require("../../common/error-handling");
let EtherealPseudoEmailService = class EtherealPseudoEmailService {
    nodemailerTransportConfig;
    transporter;
    constructor() {
        const { email: user, password: pass } = app_configuration_1.default.email;
        this.nodemailerTransportConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user, pass },
        };
        this.transporter = (0, nodemailer_1.createTransport)(this.nodemailerTransportConfig);
    }
    async sendEmail(options) {
        if (!options.from) {
            options.from = this.nodemailerTransportConfig.auth.user;
        }
        const emailSendingResult = await this.transporter
            .sendMail(options)
            .catch((0, error_handling_1.throwCustomException)('Error sending email', options));
    }
};
EtherealPseudoEmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EtherealPseudoEmailService);
exports.EtherealPseudoEmailService = EtherealPseudoEmailService;
//# sourceMappingURL=EtherealPseudoEmailService.js.map