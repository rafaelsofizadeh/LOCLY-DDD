import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/AppModule';
import { setupNestApp } from '../../../src/main';
import { IRequestAuth } from '../../../src/auth/application/RequestAuth/IRequestAuth';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import { UserType } from '../../../src/auth/entity/Token';
import { IEmailService } from '../../../src/infrastructure/email/IEmailService';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { Country } from '../../../src/order/entity/Country';

describe('[POST /auth] IRequestAuth', () => {
  let app: INestApplication;
  let requestAuth: IRequestAuth;
  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let emailService: IEmailService;

  const jwtMatcher = /.+\..+\..+/;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    requestAuth = await moduleRef.resolve(IRequestAuth);
    customerRepository = await moduleRef.resolve(ICustomerRepository);
    hostRepository = await moduleRef.resolve(IHostRepository);
    emailService = await moduleRef.resolve(IEmailService);

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Customer', () => {
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
        port: {
          email: customerEmail,
          type: UserType.Customer,
        },
      });

      expect(authUrl).toMatch(jwtMatcher);

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
        port: {
          email: customerEmail,
          type: UserType.Customer,
        },
      });

      // JWT sections are separated by 2 dots
      expect(authUrl).toMatch(jwtMatcher);

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

  describe('Host', () => {
    const hostEmail = 'testhost@requestauth.com';

    beforeAll(() => {
      // Email functionality isn't important to us right now
      jest.spyOn(emailService, 'sendEmail').mockImplementation(async () => {});
    });

    afterAll(() =>
      Promise.all([hostRepository.deleteHost({ email: hostEmail })]),
    );

    it('New', async () => {
      expect(
        await hostRepository.findHost({ email: hostEmail }, undefined, false),
      ).toBeUndefined();

      const hostCountry: Country = originCountriesAvailable[0];

      const authUrl: string = await requestAuth.execute({
        port: {
          email: hostEmail,
          type: UserType.Host,
          country: hostCountry,
        },
      });

      expect(authUrl).toMatch(jwtMatcher);

      const newHost = await hostRepository.findHost(
        { email: hostEmail },
        undefined,
        false,
      );

      expect(newHost).toMatchObject({
        email: hostEmail,
        country: hostCountry,
        verified: false,
        available: false,
        profileComplete: false,
      });
    });

    // Needs to run sequentially after 'New'!
    it('Existing', async () => {
      const oldHost = await hostRepository.findHost(
        { email: hostEmail },
        undefined,
        false,
      );

      expect(oldHost).toBeDefined();

      const authUrl: string = await requestAuth.execute({
        port: {
          email: hostEmail,
          type: UserType.Host,
        },
      });

      // JWT sections are separated by 2 dots
      expect(authUrl).toMatch(jwtMatcher);

      // Nothing should change in the host object if it has already been registered
      // — should be identical with oldHost
      expect(
        await hostRepository.findHost({ email: hostEmail }, undefined, false),
      ).toMatchObject(oldHost);
    });
  });
});
