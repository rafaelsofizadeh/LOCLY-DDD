import { Module, Provider } from '@nestjs/common';

import config from '../../../main.configuration';

import { EmailModule } from '../email/EmailModule';
import { INotificationService } from './INotificationService';
import { EmailNotificationService } from './EmailNotificationService';
import { IEmailService } from '../email/IEmailService';
import { ConsoleNotificationService } from './ConsoleNotificationService';

const providers: Provider[] = [
  {
    provide: INotificationService,
    useFactory: async (emailService: IEmailService) => {
      const { nodeEnv } = config;

      switch (nodeEnv) {
        case 'dev':
          return new ConsoleNotificationService();
        case 'prod':
          // TODO: Conditional useClass / instantiate classes in useFactory without dependencies
          return new EmailNotificationService(emailService);
        default:
          throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
      }
    },
    inject: [IEmailService],
  },
];

@Module({ imports: [EmailModule], providers, exports: providers })
export class NotificationModule {}
