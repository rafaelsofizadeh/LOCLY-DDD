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
exports.ISubmitShipmentInfo = exports.SubmitShipmentInfoRequest = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const application_1 = require("../../../common/application");
const domain_1 = require("../../../common/domain");
const Currency_1 = require("../../entity/Currency");
class Cost {
    amount;
    currency;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], Cost.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsIn)(Currency_1.Currency),
    __metadata("design:type", String)
], Cost.prototype, "currency", void 0);
class SubmitShipmentInfoRequest {
    orderId;
    totalWeight;
    shipmentCost;
    calculatorResultUrl;
    trackingNumber;
    deliveryEstimateDays;
}
__decorate([
    (0, domain_1.IsUUID)(),
    __metadata("design:type", String)
], SubmitShipmentInfoRequest.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SubmitShipmentInfoRequest.prototype, "totalWeight", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsNotEmptyObject)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_transformer_1.Type)(() => Cost),
    __metadata("design:type", Cost)
], SubmitShipmentInfoRequest.prototype, "shipmentCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SubmitShipmentInfoRequest.prototype, "calculatorResultUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], SubmitShipmentInfoRequest.prototype, "trackingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SubmitShipmentInfoRequest.prototype, "deliveryEstimateDays", void 0);
exports.SubmitShipmentInfoRequest = SubmitShipmentInfoRequest;
class ISubmitShipmentInfo extends application_1.UseCase {
}
exports.ISubmitShipmentInfo = ISubmitShipmentInfo;
//# sourceMappingURL=ISubmitShipmentInfo.js.map