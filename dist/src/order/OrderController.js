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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const IDraftOrder_1 = require("./application/DraftOrder/IDraftOrder");
const IConfirmOrder_1 = require("./application/ConfirmOrder/IConfirmOrder");
const IReceiveItem_1 = require("./application/ReceiveItem/IReceiveItem");
const IEditOrder_1 = require("./application/EditOrder/IEditOrder");
const IDeleteOrder_1 = require("./application/DeleteOrder/IDeleteOrder");
const IAddItemPhotos_1 = require("./application/AddItemPhotos/IAddItemPhotos");
const ISubmitShipmentInfo_1 = require("./application/SubmitShipmentInfo/ISubmitShipmentInfo");
const IPayShipment_1 = require("./application/PayShipment/IPayShipment");
const IdentityDecorator_1 = require("../auth/infrastructure/IdentityDecorator");
const domain_1 = require("../common/domain");
const Token_1 = require("../auth/entity/Token");
const IGetOrder_1 = require("./application/GetOrder/IGetOrder");
const IEstimateShipmentCost_1 = require("./application/EstimateShipmentCost/IEstimateShipmentCost");
const getShipmentCostQuote_1 = require("../calculator/getShipmentCostQuote");
const IGetItemPhoto_1 = require("./application/GetItemPhoto/IGetItemPhoto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const error_handling_1 = require("../common/error-handling");
let OrderController = class OrderController {
    getOrder;
    getItemPhoto;
    draftOrder;
    editOrder;
    deleteOrder;
    confirmOrder;
    receiveItem;
    addItemPhotos;
    submitShipmentInfo;
    payShipment;
    constructor(getOrder, getItemPhoto, draftOrder, editOrder, deleteOrder, confirmOrder, receiveItem, addItemPhotos, submitShipmentInfo, payShipment) {
        this.getOrder = getOrder;
        this.getItemPhoto = getItemPhoto;
        this.draftOrder = draftOrder;
        this.editOrder = editOrder;
        this.deleteOrder = deleteOrder;
        this.confirmOrder = confirmOrder;
        this.receiveItem = receiveItem;
        this.addItemPhotos = addItemPhotos;
        this.submitShipmentInfo = submitShipmentInfo;
        this.payShipment = payShipment;
    }
    estimateShipmentCostHandler({ originCountry, destinationCountry, totalWeight, }, identity) {
        return (0, getShipmentCostQuote_1.getShipmentCostQuote)(originCountry, destinationCountry, totalWeight);
    }
    async getOrderHandler(orderId, entity) {
        const userFilter = (0, domain_1.isUUID)(entity)
            ? { userId: entity, userType: Token_1.UserType.Customer }
            : { userId: entity.id, userType: Token_1.UserType.Host };
        return this.getOrder.execute({ port: { orderId, ...userFilter } });
    }
    async draftOrderHandler(unidDraftOrderRequest, customerId) {
        const draftOrderPayload = {
            ...unidDraftOrderRequest,
            customerId,
        };
        const draftOrder = await this.draftOrder.execute({
            port: draftOrderPayload,
        });
        return draftOrder;
    }
    async editOrderHandler(unidEditOrderRequest, customerId) {
        const editOrderPayload = {
            ...unidEditOrderRequest,
            customerId,
        };
        const editedDraftOrder = await this.editOrder.execute({
            port: editOrderPayload,
        });
        return editedDraftOrder;
    }
    async deleteOrderHandler(unidDeleteOrderRequest, customerId) {
        const deleteOrderPayload = {
            ...unidDeleteOrderRequest,
            customerId,
        };
        await this.deleteOrder.execute({ port: deleteOrderPayload });
    }
    async confirmOrderHandler(unidConfirmaOrderRequest, customerId) {
        const confirmOrderPayload = {
            ...unidConfirmaOrderRequest,
            customerId,
        };
        const stripeCheckoutSession = await this.confirmOrder.execute({
            port: confirmOrderPayload,
        });
        return stripeCheckoutSession;
    }
    async receiveItemHandler(unidReceiveItemRequest, { id: hostId }) {
        const receiveItemPayload = {
            ...unidReceiveItemRequest,
            hostId,
        };
        const receivedDateResult = await this.receiveItem.execute({
            port: receiveItemPayload,
        });
        return receivedDateResult;
    }
    async addItemPhotoHandler(unidAddItemPhotoRequest, photos, { id: hostId }) {
        await (0, class_validator_1.validateOrReject)(unidAddItemPhotoRequest).catch((0, error_handling_1.throwCustomException)('Error adding item photos: '));
        if (!photos || !photos.length) {
            (0, error_handling_1.throwCustomException)('Photo files must be submitted.', {}, common_1.HttpStatus.BAD_REQUEST)();
        }
        const addItemPhotoPayload = {
            ...unidAddItemPhotoRequest,
            hostId,
            photos,
        };
        const receivedDateResult = await this.addItemPhotos.execute({
            port: {
                ...addItemPhotoPayload,
            },
        });
        return receivedDateResult;
    }
    async getItemPhotoHandler(orderId, itemId, photoId, entity) {
        const userFilter = (0, domain_1.isUUID)(entity)
            ? { userId: entity, userType: Token_1.UserType.Customer }
            : { userId: entity.id, userType: Token_1.UserType.Host };
        return this.getItemPhoto.execute({
            port: { orderId, itemId, photoId, ...userFilter },
        });
    }
    async submitShipmentInfoHandler(unidSubmitShipmentInfoRequestJson, proofOfPayment, { id: hostId }) {
        const unidSubmitShipmentInfoRequest = (0, class_transformer_1.plainToClass)(ISubmitShipmentInfo_1.SubmitShipmentInfoRequest, {
            ...unidSubmitShipmentInfoRequestJson,
            shipmentCost: JSON.parse(unidSubmitShipmentInfoRequestJson.shipmentCost),
            totalWeight: Number(unidSubmitShipmentInfoRequestJson.totalWeight),
        });
        await (0, class_validator_1.validateOrReject)(unidSubmitShipmentInfoRequest).catch((0, error_handling_1.throwCustomException)('Error submitting shipment info: '));
        if (!proofOfPayment) {
            (0, error_handling_1.throwCustomException)('A proof of payment file must be submitted.', {}, common_1.HttpStatus.BAD_REQUEST)();
        }
        const submitShipmentInfoPayload = {
            ...unidSubmitShipmentInfoRequest,
            hostId,
            proofOfPayment,
        };
        const proofOfPaymentUpload = await this.submitShipmentInfo.execute({ port: submitShipmentInfoPayload });
        return proofOfPaymentUpload;
    }
    async payShipmentHandler(unidPayShipmentRequest, customerId) {
        const payShipmentPayload = {
            ...unidPayShipmentRequest,
            customerId,
        };
        const stripeCheckoutSession = await this.payShipment.execute({
            port: payShipmentPayload,
        });
        return stripeCheckoutSession;
    }
};
__decorate([
    (0, common_1.Get)('shipmentCost'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, IdentityDecorator_1.AnyIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IEstimateShipmentCost_1.EstimateShipmentCostRequest, Object]),
    __metadata("design:returntype", Object)
], OrderController.prototype, "estimateShipmentCostHandler", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, IdentityDecorator_1.AnyEntityIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderHandler", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IDraftOrder_1.DraftOrderRequest, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "draftOrderHandler", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IEditOrder_1.EditOrderRequest, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "editOrderHandler", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IDeleteOrder_1.DeleteOrderRequest, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrderHandler", null);
__decorate([
    (0, common_1.Post)('confirm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IConfirmOrder_1.ConfirmOrderRequest, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "confirmOrderHandler", null);
__decorate([
    (0, common_1.Post)('receiveItem'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.VerifiedHostIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IReceiveItem_1.ReceiveItemRequest, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "receiveItemHandler", null);
__decorate([
    (0, common_1.Post)('itemPhotos'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('photos')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, IdentityDecorator_1.VerifiedHostIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "addItemPhotoHandler", null);
__decorate([
    (0, common_1.Get)(':orderId/item/:itemId/photo/:photoId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Param)('photoId')),
    __param(3, (0, IdentityDecorator_1.AnyEntityIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getItemPhotoHandler", null);
__decorate([
    (0, common_1.Post)('shipmentInfo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('proofOfPayment')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, IdentityDecorator_1.VerifiedHostIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "submitShipmentInfoHandler", null);
__decorate([
    (0, common_1.Post)('payShipment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, IdentityDecorator_1.CustomerIdentity)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IPayShipment_1.PayShipmentRequest, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "payShipmentHandler", null);
OrderController = __decorate([
    (0, common_1.Controller)('order'),
    __metadata("design:paramtypes", [IGetOrder_1.IGetOrder,
        IGetItemPhoto_1.IGetItemPhoto,
        IDraftOrder_1.IDraftOrder,
        IEditOrder_1.IEditOrder,
        IDeleteOrder_1.IDeleteOrder,
        IConfirmOrder_1.IConfirmOrder,
        IReceiveItem_1.IReceiveItem,
        IAddItemPhotos_1.IAddItemPhotos,
        ISubmitShipmentInfo_1.ISubmitShipmentInfo,
        IPayShipment_1.IPayShipment])
], OrderController);
exports.OrderController = OrderController;
//# sourceMappingURL=OrderController.js.map