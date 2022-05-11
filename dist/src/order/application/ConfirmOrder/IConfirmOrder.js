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
exports.IConfirmOrder = exports.ConfirmOrderRequest = void 0;
const class_validator_1 = require("class-validator");
const application_1 = require("../../../common/application");
const domain_1 = require("../../../common/domain");
class ConfirmOrderRequest {
    orderId;
    balanceDiscountUsdCents = 0;
}
__decorate([
    (0, domain_1.IsUUID)(),
    __metadata("design:type", String)
], ConfirmOrderRequest.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConfirmOrderRequest.prototype, "balanceDiscountUsdCents", void 0);
exports.ConfirmOrderRequest = ConfirmOrderRequest;
class IConfirmOrder extends application_1.UseCase {
}
exports.IConfirmOrder = IConfirmOrder;
//# sourceMappingURL=IConfirmOrder.js.map