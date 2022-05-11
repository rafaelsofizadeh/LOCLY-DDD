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
exports.GetItemPhoto = void 0;
const common_1 = require("@nestjs/common");
const nest_mongodb_1 = require("nest-mongodb");
const application_1 = require("../../../common/application");
const error_handling_1 = require("../../../common/error-handling");
const persistence_1 = require("../../../common/persistence");
const IGetOrder_1 = require("../GetOrder/IGetOrder");
let GetItemPhoto = class GetItemPhoto {
    getOrder;
    photoFileCollection;
    photoChunkCollection;
    constructor(getOrder, photoFileCollection, photoChunkCollection) {
        this.getOrder = getOrder;
        this.photoFileCollection = photoFileCollection;
        this.photoChunkCollection = photoChunkCollection;
    }
    async execute({ port: getItemPhotoPayload, mongoTransactionSession, }) {
        const order = await this.getOrder.execute({ port: getItemPhotoPayload });
        const item = order.items.find(({ id }) => id === getItemPhotoPayload.itemId);
        const photoId = item.photoIds.find(id => id === getItemPhotoPayload.photoId);
        if (!photoId) {
            (0, error_handling_1.throwCustomException)('No photo found', getItemPhotoPayload, common_1.HttpStatus.NOT_FOUND)();
        }
        const photoMuuid = (0, persistence_1.uuidToMuuid)(photoId);
        const { uploadDate, filename: fileName, contentType, _id: fileMuuid, } = await this.photoFileCollection
            .findOne({ _id: photoMuuid })
            .catch((0, error_handling_1.throwCustomException)('No photo found', getItemPhotoPayload, common_1.HttpStatus.NOT_FOUND));
        const photoChunks = await this.photoChunkCollection
            .find({ files_id: fileMuuid })
            .toArray()
            .catch((0, error_handling_1.throwCustomException)('Error getting photo', getItemPhotoPayload));
        const fileData = photoChunks
            .map(chunk => chunk.data.buffer.toString('base64'))
            .join('');
        const finalFile = `data:${contentType};base64,${fileData}`;
        return {
            fileName,
            uploadDate,
            contentType,
            data: finalFile,
        };
    }
};
__decorate([
    application_1.Transaction,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GetItemPhoto.prototype, "execute", null);
GetItemPhoto = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nest_mongodb_1.InjectCollection)('host_item_photos.files')),
    __param(2, (0, nest_mongodb_1.InjectCollection)('host_item_photos.chunks')),
    __metadata("design:paramtypes", [IGetOrder_1.IGetOrder, Object, Object])
], GetItemPhoto);
exports.GetItemPhoto = GetItemPhoto;
//# sourceMappingURL=GetItemPhoto.js.map