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
exports.SetHostAvailability = void 0;
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const error_handling_1 = require("../../../common/error-handling");
const IHostRepository_1 = require("../../persistence/IHostRepository");
let SetHostAvailability = class SetHostAvailability {
    hostRepository;
    constructor(hostRepository) {
        this.hostRepository = hostRepository;
    }
    async execute({ port: setHostAvailabilityPayload, mongoTransactionSession, }) {
        await this.setHostAvailability(setHostAvailabilityPayload, mongoTransactionSession);
    }
    async setHostAvailability({ host: { id: hostId, verified, profileComplete }, available, }, sessionWithTransaction) {
        if (available === true) {
            const canHostBeAvailable = verified && profileComplete;
            if (!canHostBeAvailable) {
                const message = [];
                const requirements = [];
                if (!verified) {
                    message.push('Host is not verified. Verify to be able to set your profile availability.');
                    requirements.push('verified');
                }
                if (!profileComplete) {
                    message.push('Host profile is not complete.');
                    requirements.push('profileComplete');
                }
                const finalMessage = message.join(' | ');
                (0, error_handling_1.throwCustomException)(finalMessage, { requirements }, common_1.HttpStatus.FORBIDDEN)();
            }
        }
        return this.hostRepository.setProperties({ hostId }, { available }, sessionWithTransaction);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SetHostAvailability.prototype, "execute", null);
SetHostAvailability = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository])
], SetHostAvailability);
exports.SetHostAvailability = SetHostAvailability;
//# sourceMappingURL=SetHostAvailability.js.map