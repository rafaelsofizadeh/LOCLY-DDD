import { Module, Provider } from '@nestjs/common';
import { EmailService } from './EmailService';
import { IEmailService } from './IEmailService';

const providers: Provider[] = [
  { provide: IEmailService, useClass: EmailService },
];

@Module({ providers, exports: providers })
export class EmailModule {}
