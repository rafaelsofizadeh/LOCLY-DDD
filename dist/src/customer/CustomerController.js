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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const IdentityDecorator_1 = require("../auth/infrastructure/IdentityDecorator");
const domain_1 = require("../common/domain");
const IAddReferralCode_1 = require("./application/AddReferralCode/IAddReferralCode");
const IDeleteCustomer_1 = require("./application/DeleteCustomer/IDeleteCustomer");
const IEditCustomer_1 = require("./application/EditCustomer/IEditCustomer");
const IGetCustomer_1 = require("./application/GetCustomer/IGetCustomer");
let CustomerController = class CustomerController {
    getCustomer;
    editCustomer;
    addReferralCode;
    deleteCustomer;
    constructor(getCustomer, editCustomer, addReferralCode, deleteCustomer) {
        this.getCustomer = getCustomer;
        this.editCustomer = editCustomer;
        this.addReferralCode = addReferralCode;
        this.deleteCustomer = deleteCustomer;
    }
    async getCustomerController(customerId) {
        const { stripeCustomerId, ...customer } = await this.getCustomer.execute({
            port: { customerId },
        });
        return customer;
    }
    async addReferralCodeController(customerId, addReferralCodeRequest) {
        await this.addReferralCode.execute({
            port: { customerId, ...addReferralCodeRequest },
        });
    }
    async editCustomerController(customerId, editOrderRequest) {
        await this.editCustomer.execute({
            port: { customerId, ...editOrderRequest },
        });
    }
    async deleteCustomerController(customerId) {
        await this.deleteCustomer.execute({ port: { customerId } });
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerController", null);
__decorate([
    (0, common_1.Post)('referral'),
    __param(0, (0, IdentityDecorator_1.CustomerIdentity)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, IAddReferralCode_1.AddReferralCodeRequest]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "addReferralCodeController", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, IdentityDecorator_1.CustomerIdentity)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, IEditCustomer_1.EditCustomerRequest]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "editCustomerController", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteCustomerController", null);
CustomerController = __decorate([
    (0, common_1.Controller)('customer'),
    __metadata("design:paramtypes", [IGetCustomer_1.IGetCustomer,
        IEditCustomer_1.IEditCustomer,
        IAddReferralCode_1.IAddReferralCode,
        IDeleteCustomer_1.IDeleteCustomer])
], CustomerController);
exports.CustomerController = CustomerController;
//# sourceMappingURL=CustomerController.js.map