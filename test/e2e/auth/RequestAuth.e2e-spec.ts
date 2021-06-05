import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/AppModule';
import { setupNestApp } from '../../../src/main';
import { IRequestAuth } from '../../../src/auth/application/RequestAuth/IRequestAuth';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import { EntityType } from '../../../src/auth/entity/Token';
import { IEmailService } from '../../../src/infrastructure/email/IEmailService';

// TODO(GLOBAL)(TESTING): Substitute database name in tests

describe('[POST /auth] IRequestAuth', () => {
  let app: INestApplication;
  let requestAuth: IRequestAuth;
  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let emailService: IEmailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    requestAuth = (await moduleRef.resolve(IRequestAuth)) as IRequestAuth;
    customerRepository = (await moduleRef.resolve(
      ICustomerRepository,
    )) as ICustomerRepository;
    hostRepository = (await moduleRef.resolve(
      IHostRepository,
    )) as IHostRepository;
    emailService = (await moduleRef.resolve(IEmailService)) as IEmailService;

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Customer', async () => {
    const customerEmail = 'testcustomer@requestauth.com';

    beforeAll(() => {
      // Email functionality isn't important to us right now
      jest.spyOn(emailService, 'sendEmail').mockImplementation(async () => {});
    });

    afterAll(() =>
      Promise.all([
        customerRepository.deleteCustomer({ email: customerEmail }),
      ]),
    );

    it('New', async () => {
      expect(
        await customerRepository.findCustomer(
          { email: customerEmail },
          undefined,
          false,
        ),
      ).toBeUndefined();

      const authUrl: string = await requestAuth.execute({
        email: customerEmail,
        type: EntityType.Customer,
      });

      expect(authUrl).toMatch(/localhost:3000\/auth\/.+/);

      const newCustomer = await customerRepository.findCustomer(
        { email: customerEmail },
        undefined,
        false,
      );

      expect(newCustomer).toBeDefined();
    });

    // IMPORTANT: Needs to run sequentially after 'New'
    it('Existing', async () => {
      const oldCustomer = await customerRepository.findCustomer(
        { email: customerEmail },
        undefined,
        false,
      );

      expect(oldCustomer).toBeDefined();

      const authUrl: string = await requestAuth.execute({
        email: customerEmail,
        type: EntityType.Customer,
      });

      expect(authUrl).toMatch(/localhost:3000\/auth\/.+/);

      // Nothing should change in the customer object if it has already been registered — should be identical with
      // oldCustomer
      expect(
        await customerRepository.findCustomer(
          { email: customerEmail },
          undefined,
          false,
        ),
      ).toMatchObject(oldCustomer);
    });
  });
});
