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
exports.AddressValidationSchema = exports.isUUID = exports.IsUUID = exports.UUID = void 0;
const class_validator_1 = require("class-validator");
const uuid_1 = require("uuid");
const UUID = (id) => (id || (0, uuid_1.v4)());
exports.UUID = UUID;
const IsUUID = () => (0, class_validator_1.IsUUID)(4);
exports.IsUUID = IsUUID;
const isUUID = (input) => (0, class_validator_1.isUUID)(input, 4);
exports.isUUID = isUUID;
class AddressValidationSchema {
    addressLine1;
    addressLine2;
    locality;
    administrativeArea;
    country;
    postalCode;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 256),
    __metadata("design:type", String)
], AddressValidationSchema.prototype, "addressLine1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 256),
    __metadata("design:type", String)
], AddressValidationSchema.prototype, "addressLine2", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 256),
    __metadata("design:type", String)
], AddressValidationSchema.prototype, "locality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 256),
    __metadata("design:type", String)
], AddressValidationSchema.prototype, "administrativeArea", void 0);
__decorate([
    (0, class_validator_1.IsISO31661Alpha3)(),
    __metadata("design:type", String)
], AddressValidationSchema.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 32),
    __metadata("design:type", String)
], AddressValidationSchema.prototype, "postalCode", void 0);
exports.AddressValidationSchema = AddressValidationSchema;
//# sourceMappingURL=domain.js.map