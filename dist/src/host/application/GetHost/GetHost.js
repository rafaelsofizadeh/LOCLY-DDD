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
exports.GetHost = void 0;
const IHostRepository_1 = require("../../../host/persistence/IHostRepository");
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
let GetHost = class GetHost {
    hostRepository;
    constructor(hostRepository) {
        this.hostRepository = hostRepository;
    }
    async execute({ port: getHostPayload, mongoTransactionSession, }) {
        return this.hostRepository.findHost(getHostPayload, mongoTransactionSession);
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetHost.prototype, "execute", null);
GetHost = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IHostRepository_1.IHostRepository])
], GetHost);
exports.GetHost = GetHost;
//# sourceMappingURL=GetHost.js.map