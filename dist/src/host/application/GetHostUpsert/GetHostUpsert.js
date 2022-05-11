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
exports.GetHostUpsert = void 0;
const common_1 = require("@nestjs/common");
const IGetHost_1 = require("../GetHost/IGetHost");
const ICreateHost_1 = require("../CreateHost/ICreateHost");
const error_handling_1 = require("../../../common/error-handling");
const application_1 = require("../../../common/application");
let GetHostUpsert = class GetHostUpsert {
    getHost;
    createHost;
    constructor(getHost, createHost) {
        this.getHost = getHost;
        this.createHost = createHost;
    }
    async execute({ port: getHostUpsertPayload, mongoTransactionSession, }) {
        return this.getHostUpsert(getHostUpsertPayload, mongoTransactionSession);
    }
    async getHostUpsert({ country, ...getHostPayload }, mongoTransactionSession) {
        try {
            const host = await this.getHost.execute({
                port: getHostPayload,
                mongoTransactionSession,
            });
            return {
                host,
                upsert: false,
            };
        }
        catch (exception) {
            if (country === undefined) {
                (0, error_handling_1.throwCustomException)("Can't create a host without a country specified", {}, common_1.HttpStatus.BAD_REQUEST)();
            }
            const host = await this.createHost.execute({
                port: { country, ...getHostPayload },
                mongoTransactionSession,
            });
            return {
                host,
                upsert: true,
            };
        }
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetHostUpsert.prototype, "execute", null);
GetHostUpsert = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IGetHost_1.IGetHost,
        ICreateHost_1.ICreateHost])
], GetHostUpsert);
exports.GetHostUpsert = GetHostUpsert;
//# sourceMappingURL=GetHostUpsert.js.map