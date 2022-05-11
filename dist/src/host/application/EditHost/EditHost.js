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
exports.EditHost = void 0;
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const IHostRepository_1 = require("../../persistence/IHostRepository");
let EditHost = class EditHost {
    hostRepository;
    constructor(hostRepository) {
        this.hostRepository = hostRepository;
    }
    async execute({ port: editHostPayload, mongoTransactionSession, }) {
        await this.editHost(editHostPayload, mongoTransactionSession);
    }
    async editHost({ currentHostProperties, ...editProperties }, sessionWithTransaction) {
        const editPropertiesOnlyDefined = Object.entries(editProperties).reduce((defined, [k, v]) => {
            if (v != null)
                defined[k] = v;
            return defined;
        }, {});
        const profile = {
            ...currentHostProperties,
            ...editPropertiesOnlyDefined,
        };
        const profileComplete = ['firstName', 'lastName', 'address'].every(k => profile[k] != null &&
            (typeof profile[k] === 'object'
                ? Object.keys(profile[k]).length !== 0
                : true));
        return this.hostRepository.setProperties({ hostId: currentHostProperties.id }, { ...editPropertiesOnlyDefined, profileComplete }, sessionWithTransaction);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EditHost.prototype, "execute", null);
EditHost = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository])
], EditHost);
exports.EditHost = EditHost;
//# sourceMappingURL=EditHost.js.map