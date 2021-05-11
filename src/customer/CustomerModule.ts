import { forwardRef, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from 'nest-mongodb';
import { EmailService } from '../infrastructure/email/EmailService';
import { IEmailService } from '../infrastructure/email/IEmailService';
import { OrderModule } from '../order/OrderModule';
import { RequestAuthnCustomer } from './application/RequestAuthnCustomer/RequestAuthnCustomer';
import { IRequestAuthnCustomer } from './application/RequestAuthnCustomer/IRequestAuthnCustomer';
import { IVerifyAuthnCustomer } from './application/VerifyAuthnCustomer/IVerifyAuthnCustomer';
import { VerifyAuthnCustomer } from './application/VerifyAuthnCustomer/VerifyAuthnCustomer';
import { CustomerController } from './CustomerController';
import { CustomerMongoRepositoryAdapter } from './persistence/CustomerMongoRepositoryAdapter';
import { ICustomerRepository } from './persistence/ICustomerRepository';

const useCaseProviders: Provider[] = [
  { provide: IRequestAuthnCustomer, useClass: RequestAuthnCustomer },
  { provide: IVerifyAuthnCustomer, useClass: VerifyAuthnCustomer },
  { provide: IEmailService, useClass: EmailService },
];

const persistenceProviders: Provider[] = [
  {
    provide: ICustomerRepository,
    useClass: CustomerMongoRepositoryAdapter,
  },
];

const providers: Provider[] = [...useCaseProviders, ...persistenceProviders];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoModule.forFeature(['customers']),
    forwardRef(() => OrderModule),
  ],
  controllers: [CustomerController],
  providers,
  exports: [...persistenceProviders],
})
export class CustomerModule {}
