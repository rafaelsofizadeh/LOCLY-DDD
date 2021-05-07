import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getDbToken, MongoModule } from 'nest-mongodb';
import { StripeModule } from '@golevelup/nestjs-stripe';
import * as GridFsStorage from 'multer-gridfs-storage';

import { CustomerRepository } from '../../application/port/CustomerRepository';
import { HostRepository } from '../../application/port/HostRepository';
import { OrderRepository } from '../../application/port/OrderRepository';
import { PreConfirmOrderService } from '../../application/services/PreConfirmOrderService';
import { DraftOrderService } from '../../application/services/DraftOrderService';
import { PreConfirmOrderUseCase } from '../../domain/use-case/PreConfirmOrderUseCase';
import { DraftOrderUseCase } from '../../domain/use-case/DraftOrderUseCase';
import { CustomerMongoRepositoryAdapter } from '../persistence/customer/CustomerMongoRepositoryAdapter';
import { HostMongoRepositoryAdapter } from '../persistence/host/HostMongoRepositoryAdapter';
import { OrderMongoRepositoryAdapter } from '../persistence/order/OrderMongoRepositoryAdapter';
import { OrderController } from '../rest-api/OrderController';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmOrderUseCase } from '../../domain/use-case/ConfirmOrderUseCase';
import { ConfirmOrderWebhookHandler } from '../../application/services/ConfirmOrderService';
import { ReceiveOrderItemUseCase } from '../../domain/use-case/ReceiveOrderItemUseCase';
import { ReceiveOrderItemService } from '../../application/services/ReceiveOrderItemService';
import { EditOrderService } from '../../application/services/EditOrderService';
import { EditOrderUseCase } from '../../domain/use-case/EditOrderUseCase';
import { DeleteOrderUseCase } from '../../domain/use-case/DeleteOrderUseCase';
import { DeleteOrderService } from '../../application/services/DeleteOrderService';
import { Db } from 'mongodb';
import {
  AddItemPhotoRequest,
  AddItemPhotoUseCase,
  maxPhotoSizeBytes,
  maxSimulataneousPhotoCount,
} from '../../domain/use-case/AddItemPhotoUseCase';
import { AddItemPhotoService } from '../../application/services/AddItemPhotoService';
import { MulterModule } from '@nestjs/platform-express';
import { throwCustomException } from '../../../common/error-handling';
import { UUID } from '../../../common/domain';
import { uuidToMuuid } from '../../../common/persistence';
import { Request } from 'express';
import { FinalizeOrderService } from '../../application/services/FinalizeOrderService';
import { FinalizeOrderUseCase } from '../../domain/use-case/FinalizeOrderUseCase';

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
  { provide: FinalizeOrderUseCase, useClass: FinalizeOrderService },
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
