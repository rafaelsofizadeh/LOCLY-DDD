import { Module, Provider } from '@nestjs/common';

import config from '../../../main.configuration';

import { SendgridEmailService } from './SendgridEmailService';
import { IEmailService } from './IEmailService';
import { EtherealPseudoEmailService } from './EtherealPseudoEmailService';

const providers: Provider[] = [
  {
    provide: IEmailService,
    // TODO: useClass but with conditions? / useFactory but without explicit initialization?
    // https://github.com/nestjs/nest/issues/4476
    useFactory: () => {
      switch (config.email.service) {
        case 'sendgrid':
          return new SendgridEmailService();
        case 'ethereal':
          return new EtherealPseudoEmailService();
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
