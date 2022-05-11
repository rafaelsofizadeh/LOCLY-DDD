"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModule = void 0;
const common_1 = require("@nestjs/common");
const AddReferralCode_1 = require("./application/AddReferralCode/AddReferralCode");
const IAddReferralCode_1 = require("./application/AddReferralCode/IAddReferralCode");
const CreateCustomer_1 = require("./application/CreateCustomer/CreateCustomer");
const ICreateCustomer_1 = require("./application/CreateCustomer/ICreateCustomer");
const DeleteCustomer_1 = require("./application/DeleteCustomer/DeleteCustomer");
const IDeleteCustomer_1 = require("./application/DeleteCustomer/IDeleteCustomer");
const EditCustomer_1 = require("./application/EditCustomer/EditCustomer");
const IEditCustomer_1 = require("./application/EditCustomer/IEditCustomer");
const GetCustomer_1 = require("./application/GetCustomer/GetCustomer");
const IGetCustomer_1 = require("./application/GetCustomer/IGetCustomer");
const GetCustomerUpsert_1 = require("./application/GetCustomerUpsert/GetCustomerUpsert");
const IGetCustomerUpsert_1 = require("./application/GetCustomerUpsert/IGetCustomerUpsert");
const CustomerController_1 = require("./CustomerController");
const useCaseProviders = [
    { provide: ICreateCustomer_1.ICreateCustomer, useClass: CreateCustomer_1.CreateCustomer },
    { provide: IGetCustomer_1.IGetCustomer, useClass: GetCustomer_1.GetCustomer },
    { provide: IGetCustomerUpsert_1.IGetCustomerUpsert, useClass: GetCustomerUpsert_1.GetCustomerUpsert },
    { provide: IEditCustomer_1.IEditCustomer, useClass: EditCustomer_1.EditCustomer },
    { provide: IAddReferralCode_1.IAddReferralCode, useClass: AddReferralCode_1.AddReferralCode },
    { provide: IDeleteCustomer_1.IDeleteCustomer, useClass: DeleteCustomer_1.DeleteCustomer },
];
let CustomerModule = class CustomerModule {
};
CustomerModule = __decorate([
    (0, common_1.Module)({
        providers: [...useCaseProviders],
        exports: [...useCaseProviders],
        controllers: [CustomerController_1.CustomerController],
    })
], CustomerModule);
exports.CustomerModule = CustomerModule;
//# sourceMappingURL=CustomerModule.js.map