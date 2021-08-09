import { HttpStatus, Module, Provider } from '@nestjs/common';
import { getDbToken } from 'nest-mongodb';
import GridFsStorage from 'multer-gridfs-storage';

import { ConfirmOrder } from './application/ConfirmOrder/ConfirmOrder';
import { DraftOrder } from './application/DraftOrder/DraftOrder';
import { IConfirmOrder } from './application/ConfirmOrder/IConfirmOrder';
import { IDraftOrder } from './application/DraftOrder/IDraftOrder';
import { OrderController } from './OrderController';
import { IConfirmOrderHandler } from './application/StripeCheckoutWebhook/handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import { ConfirmOrderHandler } from './application/StripeCheckoutWebhook/handlers/ConfirmOrderHandler/ConfirmOrderHandler';
import { IReceiveItem } from './application/ReceiveItem/IReceiveItem';
import { ReceiveItem } from './application/ReceiveItem/ReceiveItem';
import { EditOrder } from './application/EditOrder/EditOrder';
import { IEditOrder } from './application/EditOrder/IEditOrder';
import { IDeleteOrder } from './application/DeleteOrder/IDeleteOrder';
import { DeleteOrder } from './application/DeleteOrder/DeleteOrder';
import { Db } from 'mongodb';
import {
  IAddItemPhotos,
  maxPhotoSizeBytes,
  maxSimulataneousPhotoCount,
} from './application/AddItemPhotos/IAddItemPhotos';
import { AddItemPhotos } from './application/AddItemPhotos/AddItemPhotos';
import { MulterModule } from '@nestjs/platform-express';
import { throwCustomException } from '../common/error-handling';
import { UUID } from '../common/domain';
import { uuidToMuuid } from '../common/persistence';
import { Request } from 'express';
import { SubmitShipmentInfo } from './application/SubmitShipmentInfo/SubmitShipmentInfo';
import { ISubmitShipmentInfo } from './application/SubmitShipmentInfo/ISubmitShipmentInfo';
import { IPayShipment } from './application/PayShipment/IPayShipment';
import { PayShipmentService } from './application/PayShipment/PayShipment';
import { IPayShipmentHandler } from './application/StripeCheckoutWebhook/handlers/PayShipmentHandler/IPayShipmentHandler';
import { PayShipmentHandler } from './application/StripeCheckoutWebhook/handlers/PayShipmentHandler/PayShipmentHandler';
import { IStripeCheckoutWebhook } from './application/StripeCheckoutWebhook/IStripeCheckoutWebhook';
import { StripeCheckoutWebhook } from './application/StripeCheckoutWebhook/StripeCheckoutWebhook';
import { IGetOrder } from './application/GetOrder/IGetOrder';
import { GetOrder } from './application/GetOrder/GetOrder';
import { GetItemPhoto } from './application/GetItemPhoto/GetItemPhoto';
import { IGetItemPhoto } from './application/GetItemPhoto/IGetItemPhoto';

const useCaseProviders: Provider[] = [
  { provide: IGetOrder, useClass: GetOrder },
  { provide: IDraftOrder, useClass: DraftOrder },
  { provide: IEditOrder, useClass: EditOrder },
  { provide: IDeleteOrder, useClass: DeleteOrder },
  { provide: IConfirmOrder, useClass: ConfirmOrder },
  { provide: IConfirmOrderHandler, useClass: ConfirmOrderHandler },
  { provide: IReceiveItem, useClass: ReceiveItem },
  { provide: IAddItemPhotos, useClass: AddItemPhotos },
  {
    provide: ISubmitShipmentInfo,
    useClass: SubmitShipmentInfo,
  },
  {
    provide: IPayShipment,
    useClass: PayShipmentService,
  },
  {
    provide: IPayShipmentHandler,
    useClass: PayShipmentHandler,
  },
  {
    provide: IStripeCheckoutWebhook,
    useClass: StripeCheckoutWebhook,
  },
  { provide: IGetItemPhoto, useClass: GetItemPhoto },
];

const testProviders: Provider[] = [];

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async (db: Db) => ({
        storage: new GridFsStorage({
          db,
          // IMPORTANT: ALWAYS PUT REQUEST BODY FIELDS BEFORE FILE FIELD, or else req.body will be empty
          // https://stackoverflow.com/a/43197040
          file: (request: Request) => {
            let bucketName: string;
            const photoId = UUID();
            const pathDestination = request.originalUrl
              .split('/')
              ?.slice(-1)[0];

            if (pathDestination === 'itemPhotos') {
              bucketName = 'host_item_photos';
            } else if (pathDestination === 'shipmentInfo') {
              bucketName = 'host_shipment_payment_proofs';
            } else {
              throwCustomException(
                'Path not allowed for file upload',
                { path: request.originalUrl },
                HttpStatus.FORBIDDEN,
              )();
            }

            return {
              id: uuidToMuuid(photoId),
              bucketName,
              filename: photoId,
            };
          },
        }),
        limits: {
          fileSize: maxPhotoSizeBytes,
          files: maxSimulataneousPhotoCount,
        },
        fileFilter: (request, { mimetype }, cb) => {
          const createRegexFilter = (
            type: keyof typeof allowedExtensions,
          ): RegExp => {
            return new RegExp(
              `^${type}\\/(${allowedExtensions[type]
                .map(ext => escapeRegex(ext))
                .join('|')})$`,
            );
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

          const filterGroups: {
            [path: string]: Array<keyof typeof allowedExtensions>;
          } = {
            itemPhotos: ['image', 'video'],
            shipmentInfo: ['image', 'application'],
          };

          const pathDestination = request.originalUrl.split('/')?.slice(-1)[0];

          if (!filterGroups.hasOwnProperty(pathDestination)) {
            try {
              throwCustomException(
                'Path not allowed for file upload',
                { path: request.originalUrl },
                HttpStatus.FORBIDDEN,
              )();
            } catch (exception) {
              cb(exception, false);
            }
          }

          if (
            !filterGroups[pathDestination].some(filter =>
              createRegexFilter(filter).test(mimetype),
            )
          ) {
            filterGroups[pathDestination].map(filter =>
              console.log(
                createRegexFilter(filter),
                mimetype,
                createRegexFilter(filter).test(mimetype),
              ),
            );

            try {
              throwCustomException(
                'Unsupported file mimetype for path',
                {
                  path: request.originalUrl,
                  allowedFileMimetypes: filterGroups[pathDestination].reduce(
                    (allowed, type) => {
                      allowed[type] = allowedExtensions[type];
                      return allowed;
                    },
                    {},
                  ),
                  actualFileMimetype: mimetype,
                },
                HttpStatus.BAD_REQUEST,
              )();
            } catch (exception) {
              cb(exception, false);
            }
          }

          cb(undefined, true);
        },
      }),
      inject: [getDbToken()],
    }),
  ],
  controllers: [OrderController],
  providers: [...useCaseProviders, ...testProviders],
  exports: [...useCaseProviders],
})
export class OrderModule {}

function escapeRegex(string: string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
