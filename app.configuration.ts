import secrets, { EtherealEmailConfig, MailchimpEmailConfig } from 'secrets';

export default (() => {
  const shared = (domain: string) => ({
    domain,
    nodeEnv: process.env.APP_ENV as 'dev' | 'prod',
    stripe: {
      apiKey: secrets.stripe.apiKey,
      successPageUrl: `${domain}/order/thank-you`,
      cancelPageUrl: `${domain}/order/error`,
      // IMPORTANT: Keep track of all Stripe integrations' api versions (including webhooks)
      apiVersion: '2020-08-27' as const,
      webhook: {
        // Default set in @golevelup/nestjs-stripe library
        path: 'stripe/webhook',
        secret: secrets.stripe.webhookSecret,
      },
    },
    cookie: {
      authIndicatorName: 'auth',
      tokenName: 'token',
      tokenExpiration: '7d',
    },
    auth: {
      tokenKey: secrets.authTokenKey,
      verificationTokenExpiration: '30m',
      authTokenExpiration: '7d',
    },
    mongo: { connectionString: secrets.mongoConnectionString },
    email: secrets.email,
    serviceFee: {
      stripeProductId: 'prod_KhDFjew4BDycpd',
      stripePriceId: 'price_1K1oojFkgohp7fDw5cKL2wiy',
      loclyCutPercent: 20,
    },
    rewards: {
      referralUsd: 5,
      refereeUsd: 5,
      codeLength: 6,
    },
    host: {
      payoutDelayDays: 19,
    },
  });

  if (process.env.APP_ENV === 'dev') {
    const sharedConfig = shared('http://localhost:3000');

    return {
      ...sharedConfig,
      mongo: {
        ...sharedConfig.mongo,
        dbName: 'dev',
      },
      cookie: {
        ...sharedConfig.cookie,
        cors: { secure: false, sameSite: 'lax' },
      },
    };
  }

  if (process.env.APP_ENV === 'prod') {
    const sharedConfig = shared('https://aqueous-caverns-91110.herokuapp.com');

    return {
      ...sharedConfig,
      mongo: {
        ...sharedConfig.mongo,
        dbName: 'prod',
      },
      cookie: {
        ...sharedConfig.cookie,
        // Only 'SameSite=None; Secure' cookies are forwarded in third-party requests,
        // which is necessary in production to allow the front-end on domain X (see main.ts :: enableCors config)
        // to send request to server on domain Y:
        // https://stackoverflow.com/a/46412839/6539857
        // https://digiday.com/media/what-is-chrome-samesite/
        cors: { secure: true, sameSite: 'none' },
      },
    };
  }

  throw new Error('No ENV passed');
})();

export type StripeConfig = {
  apiKey: string;
  apiVersion: '2020-08-27';
  webhook: {
    secret: string;
    path: string;
  };
  successPageUrl: string;
  cancelPageUrl: string;
};

export type MongoConfig = {
  connectionString: string;
  dbName: string;
};

export type CookieConfig = {
  authIndicatorName: string;
  tokenName: string;
  tokenExpiration: string;
  cors: {
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
};

export type AuthConfig = {
  tokenKey: string;
  verificationTokenExpiration: string;
  authTokenExpiration: string;
};

export type AppConfig = {
  domain: string;
  nodeEnv: 'dev' | 'prod';
  stripe: StripeConfig;
  mongo: MongoConfig;
  cookie: CookieConfig;
  auth: AuthConfig;
  email: EmailConfig;
};

export type EmailConfig = EtherealEmailConfig | MailchimpEmailConfig;
