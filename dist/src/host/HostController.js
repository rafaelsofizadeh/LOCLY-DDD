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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostController = void 0;
const common_1 = require("@nestjs/common");
const IGetHostAccountLink_1 = require("./application/GetHostAccountLink/IGetHostAccountLink");
const IdentityDecorator_1 = require("../auth/infrastructure/IdentityDecorator");
const IEditHost_1 = require("./application/EditHost/IEditHost");
const ISetHostAvailability_1 = require("./application/SetHostAvailability/ISetHostAvailability");
const IGetHost_1 = require("./application/GetHost/IGetHost");
const IDeleteHost_1 = require("./application/DeleteHost/IDeleteHost");
let HostController = class HostController {
    getHost;
    getHostAccountLink;
    editHost;
    deleteHost;
    setHostAvailability;
    constructor(getHost, getHostAccountLink, editHost, deleteHost, setHostAvailability) {
        this.getHost = getHost;
        this.getHostAccountLink = getHostAccountLink;
        this.editHost = editHost;
        this.deleteHost = deleteHost;
        this.setHostAvailability = setHostAvailability;
    }
    async getHostController({ id: hostId }) {
        const { stripeAccountId, ...serializedHost } = await this.getHost.execute({ port: { hostId } });
        return serializedHost;
    }
    async getHostAccountLinkController({ stripeAccountId }) {
        const accountLink = await this.getHostAccountLink.execute({
            port: { stripeAccountId },
        });
        return accountLink;
    }
    async editHostController(host, editHostRequest) {
        await this.editHost.execute({
            port: {
                currentHostProperties: host,
                ...editHostRequest,
            },
        });
    }
    async setHostAvailabilityController(host, setHostAvailabilityRequest) {
        await this.setHostAvailability.execute({
            port: {
                host,
                ...setHostAvailabilityRequest,
            },
        });
    }
    async deleteHostController({ id: hostId }) {
        await this.deleteHost.execute({ port: { hostId } });
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, IdentityDecorator_1.AnyHostIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getHostController", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, IdentityDecorator_1.AnyHostIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getHostAccountLinkController", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, IdentityDecorator_1.AnyHostIdentity)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, IEditHost_1.EditHostRequest]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "editHostController", null);
__decorate([
    (0, common_1.Patch)('availability'),
    __param(0, (0, IdentityDecorator_1.VerifiedHostIdentity)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ISetHostAvailability_1.SetHostAvailabilityRequest]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "setHostAvailabilityController", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, IdentityDecorator_1.AnyHostIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "deleteHostController", null);
HostController = __decorate([
    (0, common_1.Controller)('host'),
    __metadata("design:paramtypes", [IGetHost_1.IGetHost,
        IGetHostAccountLink_1.IGetHostAccountLink,
        IEditHost_1.IEditHost,
        IDeleteHost_1.IDeleteHost,
        ISetHostAvailability_1.ISetHostAvailability])
], HostController);
exports.HostController = HostController;
//# sourceMappingURL=HostController.js.map