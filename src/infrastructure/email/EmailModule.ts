import { Module, Provider } from '@nestjs/common';
import { SendgridEmailService } from './SendgridEmailService';
import { IEmailService } from './IEmailService';
import { ConfigService } from '@nestjs/config';
import { EtherealPseudoEmailService } from './EtherealPseudoEmailService';

const providers: Provider[] = [
  {
    provide: IEmailService,
    // TODO: useClass but with conditions? / useFactory but without explicit initialization?
    // https://github.com/nestjs/nest/issues/4476
    useFactory: (configService: ConfigService) => {
      switch (configService.get<string>('EMAIL_SERVICE')) {
        case 'sendgrid':
          return new SendgridEmailService(configService);
        case 'ethereal_pseudo':
          return new EtherealPseudoEmailService(configService);
        default:
          console.log(
            'No email service specified. Falling back to default Ethereal for emails.',
          );
          return new EtherealPseudoEmailService(configService);
      }
    },
    inject: [ConfigService],
  },
];

@Module({ providers, exports: providers })
export class EmailModule {}
