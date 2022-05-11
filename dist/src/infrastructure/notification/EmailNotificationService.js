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
exports.EmailNotificationService = void 0;
const common_1 = require("@nestjs/common");
const IEmailService_1 = require("../email/IEmailService");
const INotificationService_1 = require("./INotificationService");
let EmailNotificationService = class EmailNotificationService {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    templates = {
        [INotificationService_1.NotificationType.Auth]: ({ domain, token }) => `<a href="${domain}/auth/${token}">Click here to log-in to Locly.</a>`,
        [INotificationService_1.NotificationType.CustomerConfirmedOrder]: ({ order }) => 'a',
        [INotificationService_1.NotificationType.HostReceivedItem]: ({ order, receivedItemId }) => 'a',
        [INotificationService_1.NotificationType.HostUploadedItemPhoto]: ({ order, receivedItemId }) => 'a',
        [INotificationService_1.NotificationType.HostSubmittedShipmentInfo]: ({ order }) => 'a',
        [INotificationService_1.NotificationType.CustomerPaidShipment]: ({ order }) => 'a',
    };
    subjects = {
        [INotificationService_1.NotificationType.Auth]: 'Your Locly log-in link',
        [INotificationService_1.NotificationType.CustomerConfirmedOrder]: 'You have created and confirmed a new order',
        [INotificationService_1.NotificationType.HostReceivedItem]: 'Your host has received an item from your order',
        [INotificationService_1.NotificationType.HostUploadedItemPhoto]: 'Your host has uploaded a photo for an item from your order',
        [INotificationService_1.NotificationType.HostSubmittedShipmentInfo]: "Your host submitted your order's shipment info",
        [INotificationService_1.NotificationType.CustomerPaidShipment]: 'Your order payment receipt',
    };
    async notify(recipient, notificationType, templateArgs) {
        const html = this.templates[notificationType](templateArgs);
        const subject = this.subjects[notificationType];
        this.emailService.sendEmail({
            to: recipient,
            subject,
            html,
        });
    }
};
EmailNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IEmailService_1.IEmailService])
], EmailNotificationService);
exports.EmailNotificationService = EmailNotificationService;
//# sourceMappingURL=EmailNotificationService.js.map