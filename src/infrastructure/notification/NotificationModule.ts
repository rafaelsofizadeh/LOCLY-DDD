import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/EmailModule';
import { INotificationService } from './INotificationService';
import { EmailNotificationService } from './EmailNotificationService';
import { IEmailService } from '../email/IEmailService';

const providers: Provider[] = [
  {
    provide: INotificationService,
    useFactory: async (
      configService: ConfigService,
      emailService: IEmailService,
    ) => {
      const nodeEnv = configService.get<string>('NODE_ENV');

      switch (nodeEnv) {
        case 'dev':
        // console notification service
        case 'prod':
          // TODO: Conditional useClass / instantiate classes in useFactory without dependencies
          return new EmailNotificationService(emailService);
        default:
          throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
      }
    },
    inject: [ConfigService, IEmailService],
  },
];

@Module({ imports: [EmailModule], providers, exports: providers })
export class NotificationModule {}
