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
exports.GetCustomerUpsert = void 0;
const common_1 = require("@nestjs/common");
const application_1 = require("../../../common/application");
const IGetCustomer_1 = require("../GetCustomer/IGetCustomer");
const ICreateCustomer_1 = require("../CreateCustomer/ICreateCustomer");
let GetCustomerUpsert = class GetCustomerUpsert {
    getCustomer;
    createCustomer;
    constructor(getCustomer, createCustomer) {
        this.getCustomer = getCustomer;
        this.createCustomer = createCustomer;
    }
    async execute({ port: getCustomerUpsertPayload, mongoTransactionSession, }) {
        return this.getCustomerUpsert(getCustomerUpsertPayload, mongoTransactionSession);
    }
    async getCustomerUpsert(getCustomerUpsertPayload, mongoTransactionSession) {
        try {
            return {
                customer: await this.getCustomer.execute({
                    port: getCustomerUpsertPayload,
                    mongoTransactionSession,
                }),
                upsert: false,
            };
        }
        catch (exception) {
            return {
                customer: await this.createCustomer.execute({
                    port: getCustomerUpsertPayload,
                    mongoTransactionSession,
                }),
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
], GetCustomerUpsert.prototype, "execute", null);
GetCustomerUpsert = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [IGetCustomer_1.IGetCustomer,
        ICreateCustomer_1.ICreateCustomer])
], GetCustomerUpsert);
exports.GetCustomerUpsert = GetCustomerUpsert;
//# sourceMappingURL=GetCustomerUpsert.js.map