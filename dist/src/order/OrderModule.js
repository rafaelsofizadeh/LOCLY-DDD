"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const nest_mongodb_1 = require("nest-mongodb");
const multer_gridfs_storage_1 = __importDefault(require("multer-gridfs-storage"));
const ConfirmOrder_1 = require("./application/ConfirmOrder/ConfirmOrder");
const DraftOrder_1 = require("./application/DraftOrder/DraftOrder");
const IConfirmOrder_1 = require("./application/ConfirmOrder/IConfirmOrder");
const IDraftOrder_1 = require("./application/DraftOrder/IDraftOrder");
const OrderController_1 = require("./OrderController");
const IConfirmOrderHandler_1 = require("./application/StripeCheckoutWebhook/handlers/ConfirmOrderHandler/IConfirmOrderHandler");
const ConfirmOrderHandler_1 = require("./application/StripeCheckoutWebhook/handlers/ConfirmOrderHandler/ConfirmOrderHandler");
const IReceiveItem_1 = require("./application/ReceiveItem/IReceiveItem");
const ReceiveItem_1 = require("./application/ReceiveItem/ReceiveItem");
const EditOrder_1 = require("./application/EditOrder/EditOrder");
const IEditOrder_1 = require("./application/EditOrder/IEditOrder");
const IDeleteOrder_1 = require("./application/DeleteOrder/IDeleteOrder");
const DeleteOrder_1 = require("./application/DeleteOrder/DeleteOrder");
const IAddItemPhotos_1 = require("./application/AddItemPhotos/IAddItemPhotos");
const AddItemPhotos_1 = require("./application/AddItemPhotos/AddItemPhotos");
const platform_express_1 = require("@nestjs/platform-express");
const error_handling_1 = require("../common/error-handling");
const domain_1 = require("../common/domain");
const persistence_1 = require("../common/persistence");
const SubmitShipmentInfo_1 = require("./application/SubmitShipmentInfo/SubmitShipmentInfo");
const ISubmitShipmentInfo_1 = require("./application/SubmitShipmentInfo/ISubmitShipmentInfo");
const IPayShipment_1 = require("./application/PayShipment/IPayShipment");
const PayShipment_1 = require("./application/PayShipment/PayShipment");
const IPayShipmentHandler_1 = require("./application/StripeCheckoutWebhook/handlers/PayShipmentHandler/IPayShipmentHandler");
const PayShipmentHandler_1 = require("./application/StripeCheckoutWebhook/handlers/PayShipmentHandler/PayShipmentHandler");
const IStripeCheckoutWebhook_1 = require("./application/StripeCheckoutWebhook/IStripeCheckoutWebhook");
const StripeCheckoutWebhook_1 = require("./application/StripeCheckoutWebhook/StripeCheckoutWebhook");
const IGetOrder_1 = require("./application/GetOrder/IGetOrder");
const GetOrder_1 = require("./application/GetOrder/GetOrder");
const GetItemPhoto_1 = require("./application/GetItemPhoto/GetItemPhoto");
const IGetItemPhoto_1 = require("./application/GetItemPhoto/IGetItemPhoto");
const useCaseProviders = [
    { provide: IGetOrder_1.IGetOrder, useClass: GetOrder_1.GetOrder },
    { provide: IDraftOrder_1.IDraftOrder, useClass: DraftOrder_1.DraftOrder },
    { provide: IEditOrder_1.IEditOrder, useClass: EditOrder_1.EditOrder },
    { provide: IDeleteOrder_1.IDeleteOrder, useClass: DeleteOrder_1.DeleteOrder },
    { provide: IConfirmOrder_1.IConfirmOrder, useClass: ConfirmOrder_1.ConfirmOrder },
    { provide: IConfirmOrderHandler_1.IConfirmOrderHandler, useClass: ConfirmOrderHandler_1.ConfirmOrderHandler },
    { provide: IReceiveItem_1.IReceiveItem, useClass: ReceiveItem_1.ReceiveItem },
    { provide: IAddItemPhotos_1.IAddItemPhotos, useClass: AddItemPhotos_1.AddItemPhotos },
    {
        provide: ISubmitShipmentInfo_1.ISubmitShipmentInfo,
        useClass: SubmitShipmentInfo_1.SubmitShipmentInfo,
    },
    {
        provide: IPayShipment_1.IPayShipment,
        useClass: PayShipment_1.PayShipmentService,
    },
    {
        provide: IPayShipmentHandler_1.IPayShipmentHandler,
        useClass: PayShipmentHandler_1.PayShipmentHandler,
    },
    {
        provide: IStripeCheckoutWebhook_1.IStripeCheckoutWebhook,
        useClass: StripeCheckoutWebhook_1.StripeCheckoutWebhook,
    },
    { provide: IGetItemPhoto_1.IGetItemPhoto, useClass: GetItemPhoto_1.GetItemPhoto },
];
const testProviders = [];
let OrderModule = class OrderModule {
};
OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                useFactory: async (db) => ({
                    storage: new multer_gridfs_storage_1.default({
                        db,
                        file: (request) => {
                            let bucketName;
                            const photoId = (0, domain_1.UUID)();
                            const pathDestination = request.originalUrl
                                .split('/')
                                ?.slice(-1)[0];
                            if (pathDestination === 'itemPhotos') {
                                bucketName = 'host_item_photos';
                            }
                            else if (pathDestination === 'shipmentInfo') {
                                bucketName = 'host_shipment_payment_proofs';
                            }
                            else {
                                (0, error_handling_1.throwCustomException)('Path not allowed for file upload', { path: request.originalUrl }, common_1.HttpStatus.FORBIDDEN)();
                            }
                            return {
                                id: (0, persistence_1.uuidToMuuid)(photoId),
                                bucketName,
                                filename: photoId,
                            };
                        },
                    }),
                    limits: {
                        fileSize: IAddItemPhotos_1.maxPhotoSizeBytes,
                        files: IAddItemPhotos_1.maxSimulataneousPhotoCount,
                    },
                    fileFilter: (request, { mimetype }, cb) => {
                        const createRegexFilter = (type) => {
                            return new RegExp(`^${type}\\/(${allowedExtensions[type]
                                .map(ext => escapeRegex(ext))
                                .join('|')})$`);
                        };
                        const allowedExtensions = {
                            image: ['jpeg', 'jpg', 'png', 'gif', 'heic', 'mp4'],
                            video: ['mp4', 'mpeg', 'avi', 'ogg', 'webm'],
                            application: [
                                'msword',
                                'pdf',
                                'vnd.openxmlformats-officedocument.wordprocessingml.document',
                            ],
                        };
                        const filterGroups = {
                            itemPhotos: ['image', 'video'],
                            shipmentInfo: ['image', 'application'],
                        };
                        const pathDestination = request.originalUrl.split('/')?.slice(-1)[0];
                        if (!filterGroups.hasOwnProperty(pathDestination)) {
                            try {
                                (0, error_handling_1.throwCustomException)('Path not allowed for file upload', { path: request.originalUrl }, common_1.HttpStatus.FORBIDDEN)();
                            }
                            catch (exception) {
                                cb(exception, false);
                            }
                        }
                        if (!filterGroups[pathDestination].some(filter => createRegexFilter(filter).test(mimetype))) {
                            try {
                                (0, error_handling_1.throwCustomException)('Unsupported file mimetype for path', {
                                    path: request.originalUrl,
                                    allowedFileMimetypes: filterGroups[pathDestination].reduce((allowed, type) => {
                                        allowed[type] = allowedExtensions[type];
                                        return allowed;
                                    }, {}),
                                    actualFileMimetype: mimetype,
                                }, common_1.HttpStatus.BAD_REQUEST)();
                            }
                            catch (exception) {
                                cb(exception, false);
                            }
                        }
                        cb(undefined, true);
                    },
                }),
                inject: [(0, nest_mongodb_1.getDbToken)()],
            }),
        ],
        controllers: [OrderController_1.OrderController],
        providers: [...useCaseProviders, ...testProviders],
        exports: [...useCaseProviders],
    })
], OrderModule);
exports.OrderModule = OrderModule;
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
//# sourceMappingURL=OrderModule.js.map