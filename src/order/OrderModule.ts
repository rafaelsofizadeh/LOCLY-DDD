import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getDbToken, MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';
import * as GridFsStorage from 'multer-gridfs-storage';

import { CustomerRepository } from '../customer/persistence/CustomerRepository';
import { HostRepository } from '../host/persistence/HostRepository';
import { OrderRepository } from './persistence/OrderRepository';
import { PreConfirmOrderService } from './application/PreConfirmOrder/PreConfirmOrderService';
import { DraftOrderService } from './application/DraftOrder/DraftOrderService';
import { PreConfirmOrderUseCase } from './application/PreConfirmOrder/PreConfirmOrderUseCase';
import { DraftOrderUseCase } from './application/DraftOrder/DraftOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../customer/persistence/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../host/persistence/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from './persistence/OrderMongoRepositoryAdapter';
import { OrderController } from './OrderController';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmOrderUseCase } from './application/ConfirmOrder/ConfirmOrderUseCase';
import { ConfirmOrderWebhookHandler } from './application/ConfirmOrder/ConfirmOrderWebhookHandler';
import { ReceiveOrderItemUseCase } from './application/ReceiveOrderItem/ReceiveOrderItemUseCase';
import { ReceiveOrderItemService } from './application/ReceiveOrderItem/ReceiveOrderItemService';
import { EditOrderService } from './application/EditOrder/EditOrderService';
import { EditOrderUseCase } from './application/EditOrder/EditOrderUseCase';
import { DeleteOrderUseCase } from './application/DeleteOrder/DeleteOrderUseCase';
import { DeleteOrderService } from './application/DeleteOrder/DeleteOrderService';
import { Db } from 'mongodb';
import {
  AddItemPhotoRequest,
  AddItemPhotoUseCase,
  maxPhotoSizeBytes,
  maxSimulataneousPhotoCount,
} from './application/AddItemPhoto/AddItemPhotoUseCase';
import { AddItemPhotoService } from './application/AddItemPhoto/AddItemPhotoService';
import { MulterModule } from '@nestjs/platform-express';
import { throwCustomException } from '../common/error-handling';
import { UUID } from '../common/domain';
import { uuidToMuuid } from '../common/persistence';
import { Request } from 'express';
import { SubmitShipmentInfoService } from './application/SubmitShipmentInfo/SubmitShipmentInfoService';
import { SubmitShipmentInfoUseCase } from './application/SubmitShipmentInfo/SubmitShipmentInfoUseCase';
import { PrePayOrderShipmentFeeUseCase } from './application/PrePayOrderShipmentFee/PrePayOrderShipmentFeeUseCase';
import { PrePayOrderShipmentFeeService } from './application/PrePayOrderShipmentFee/PrePayOrderShipmentFeeService';
import { PayOrderShipmentFeeUseCase } from './application/PayOrderShipmentFee/PayOrderShipmentFeeUseCase';
import { PayOrderShipmentFeeWebhookHandler } from './application/PayOrderShipmentFee/PayOrderShipmentFeeWebhookHandler';
import { StripeCheckoutCompletedUseCase } from './application/StripeCheckoutCompleted/StripeCheckoutCompletedUseCase';
import { StripeCheckoutCompletedWebhookHandler } from './application/StripeCheckoutCompleted/StripeCheckoutCompletedWebhookHandler';

const imports: DynamicModule[] = [
  ConfigModule.forRoot(),
  MongoModule.forFeature(['orders', 'customers', 'hosts']),
  StripeModule.forRootAsync(StripeModule, {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      apiKey: configService.get<string>('STRIPE_SECRET_API_TEST_KEY'),
      webhookConfig: {
        stripeWebhookSecret: configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      },
    }),
    inject: [ConfigService],
  }),
  MulterModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (db: Db) => ({
      storage: new GridFsStorage({
        db,
        // TODO: Better 'file' function typing
        // IMPORTANT: ALWAYS PUT REQUEST BODY FIELDS BEFORE FILE FIELD, or else req.body might be unpopulated
        // https://stackoverflow.com/a/43197040
        file: (request: Request) => {
          const { hostId, itemId } = request.body as AddItemPhotoRequest;

          const photoId = UUID();

          return {
            id: uuidToMuuid(photoId),
            bucketName: 'host_item_photos',
            filename: `${photoId}_hostId:${hostId}_itemId:${itemId}`,
          };
        },
      }),
      limits: {
        fileSize: maxPhotoSizeBytes,
        files: maxSimulataneousPhotoCount,
      },
      fileFilter: (req, { mimetype }, cb) => {
        if (!/image\/jpeg|jpg|png|gif|heic/.test(mimetype)) {
          try {
            throwCustomException('Unsupported file mimetype', {
              allowedFileMimetypes: ['jpeg', 'jpg', 'png', 'gif', 'heic'],
              actualFileMimetype: mimetype,
            })();
          } catch (exception) {
            cb(exception, false);
          }
        }

        cb(undefined, true);
      },
    }),
    inject: [getDbToken()],
  }),
];

const persistenceProviders: Provider[] = [
  { provide: OrderRepository, useClass: OrderMongoRepositoryAdapter },
  { provide: CustomerRepository, useClass: CustomerMongoRepositoryAdapter },
  { provide: HostRepository, useClass: HostMongoRepositoryAdapter },
];

const useCaseProviders: Provider[] = [
  { provide: DraftOrderUseCase, useClass: DraftOrderService },
  { provide: EditOrderUseCase, useClass: EditOrderService },
  { provide: DeleteOrderUseCase, useClass: DeleteOrderService },
  { provide: PreConfirmOrderUseCase, useClass: PreConfirmOrderService },
  { provide: ConfirmOrderUseCase, useClass: ConfirmOrderWebhookHandler },
  { provide: ReceiveOrderItemUseCase, useClass: ReceiveOrderItemService },
  { provide: AddItemPhotoUseCase, useClass: AddItemPhotoService },
  {
    provide: SubmitShipmentInfoUseCase,
    useClass: SubmitShipmentInfoService,
  },
  {
    provide: PrePayOrderShipmentFeeUseCase,
    useClass: PrePayOrderShipmentFeeService,
  },
  {
    provide: PayOrderShipmentFeeUseCase,
    useClass: PayOrderShipmentFeeWebhookHandler,
  },
  {
    provide: StripeCheckoutCompletedUseCase,
    useClass: StripeCheckoutCompletedWebhookHandler,
  },
];

// TODO(NOW): find a better place to initialize testing dependencies (through .env? npm scripts?)
// ATTENTION: Cool thing. Polymorphism (?) through interface injections.
const testProviders: Provider[] = [];

@Module({
  imports,
  controllers: [OrderController],
  providers: [...persistenceProviders, ...useCaseProviders, ...testProviders],
})
export class OrderModule {}
