import { forwardRef, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from 'nest-mongodb';
import { EmailService } from '../infrastructure/email/EmailService';
import { IEmailService } from '../infrastructure/email/IEmailService';
import { OrderModule } from '../order/OrderModule';
import { AuthnCustomer } from './application/AuthnCustomer/AuthnCustomer';
import { IAuthnCustomer } from './application/AuthnCustomer/IAuthnCustomer';
import { IVerifyAuthn } from './application/VerifyAuthn/IVerifyAuthn';
import { VerifyAuthn } from './application/VerifyAuthn/VerifyAuthn';
import { CustomerController } from './CustomerController';
import { CustomerMongoRepositoryAdapter } from './persistence/CustomerMongoRepositoryAdapter';
import { ICustomerRepository } from './persistence/ICustomerRepository';

const useCaseProviders: Provider[] = [
  { provide: IAuthnCustomer, useClass: AuthnCustomer },
  { provide: IVerifyAuthn, useClass: VerifyAuthn },
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
