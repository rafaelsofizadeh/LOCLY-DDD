import { Module, Provider } from '@nestjs/common';

import config from '../../../app.configuration';

import { MailchimpEmailService } from './MailchimpEmailService';
import { IEmailService } from './IEmailService';
import { EtherealPseudoEmailService } from './EtherealPseudoEmailService';
import { MailtrapPseudoEmailService } from './MailtrapPseudoEmailService';

const providers: Provider[] = [
  {
    provide: IEmailService,
    // TODO: useClass but with conditions? / useFactory but without explicit initialization?
    // https://github.com/nestjs/nest/issues/4476
    useFactory: () => {
      switch (config.email.service) {
        case 'mailchimp':
        // return new MailchimpEmailService();
        case 'mailtrap':
        case 'ethereal':
          return new MailtrapPseudoEmailService();
        default:
          console.log(
            'No email service specified. Falling back to default Ethereal for emails.',
          );
          return new EtherealPseudoEmailService();
      }
    },
  },
];

@Module({ providers, exports: providers })
export class EmailModule {}
