"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostModule = void 0;
const common_1 = require("@nestjs/common");
const CreateHost_1 = require("./application/CreateHost/CreateHost");
const ICreateHost_1 = require("./application/CreateHost/ICreateHost");
const DeleteHost_1 = require("./application/DeleteHost/DeleteHost");
const IDeleteHost_1 = require("./application/DeleteHost/IDeleteHost");
const EditHost_1 = require("./application/EditHost/EditHost");
const IEditHost_1 = require("./application/EditHost/IEditHost");
const GetHost_1 = require("./application/GetHost/GetHost");
const IGetHost_1 = require("./application/GetHost/IGetHost");
const GetHostAccountLink_1 = require("./application/GetHostAccountLink/GetHostAccountLink");
const IGetHostAccountLink_1 = require("./application/GetHostAccountLink/IGetHostAccountLink");
const GetHostUpsert_1 = require("./application/GetHostUpsert/GetHostUpsert");
const IGetHostUpsert_1 = require("./application/GetHostUpsert/IGetHostUpsert");
const ISetHostAvailability_1 = require("./application/SetHostAvailability/ISetHostAvailability");
const SetHostAvailability_1 = require("./application/SetHostAvailability/SetHostAvailability");
const IUpdateHostAccountHandler_1 = require("./application/StripeAccountUpdatedWebhook/handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler");
const UpdateHostAccountHandler_1 = require("./application/StripeAccountUpdatedWebhook/handlers/UpdateHostAccountHandler/UpdateHostAccountHandler");
const IStripeAccountUpdatedWebhook_1 = require("./application/StripeAccountUpdatedWebhook/IStripeAccountUpdatedWebhook");
const StripeAccountUpdatedWebhook_1 = require("./application/StripeAccountUpdatedWebhook/StripeAccountUpdatedWebhook");
const HostController_1 = require("./HostController");
const useCaseProviders = [
    { provide: ICreateHost_1.ICreateHost, useClass: CreateHost_1.CreateHost },
    { provide: IGetHost_1.IGetHost, useClass: GetHost_1.GetHost },
    { provide: IGetHostUpsert_1.IGetHostUpsert, useClass: GetHostUpsert_1.GetHostUpsert },
    { provide: IGetHostAccountLink_1.IGetHostAccountLink, useClass: GetHostAccountLink_1.GetHostAccountLink },
    { provide: IEditHost_1.IEditHost, useClass: EditHost_1.EditHost },
    { provide: IDeleteHost_1.IDeleteHost, useClass: DeleteHost_1.DeleteHost },
    { provide: ISetHostAvailability_1.ISetHostAvailability, useClass: SetHostAvailability_1.SetHostAvailability },
    {
        provide: IStripeAccountUpdatedWebhook_1.IStripeAccountUpdatedWebhook,
        useClass: StripeAccountUpdatedWebhook_1.StripeAccountUpdatedWebhook,
    },
    { provide: IUpdateHostAccountHandler_1.IUpdateHostAccount, useClass: UpdateHostAccountHandler_1.UpdateHostAccountHandler },
];
let HostModule = class HostModule {
};
HostModule = __decorate([
    (0, common_1.Module)({
        controllers: [HostController_1.HostController],
        providers: [...useCaseProviders],
        exports: [...useCaseProviders],
    })
], HostModule);
exports.HostModule = HostModule;
//# sourceMappingURL=HostModule.js.map