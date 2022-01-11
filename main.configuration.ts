// REMINDER: Keep track of all Stripe integrations' api versions (including webhooks)
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

// Default set in @golevelup/nestjs-stripe library
const stripeWebhookShared = { path: 'stripe/webhook' };

const stripeShared = {
  apiVersion: '2020-08-27' as const,
};

export type MongoConfig = {
  connectionString: string;
  dbName: string;
};

const mongoShared = {
  connectionString:
    'mongodb+srv://rafasofizada:FhD8qEQLyaaLozK6@cluster0.tcrn6.mongodb.net/test?authSource=admin&replicaSet=atlas-zrpmay-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true',
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

const cookieShared = {
  authIndicatorName: 'auth',
  tokenName: 'token',
  tokenExpiration: '7d',
};

export type AuthConfig = {
  tokenKey: string;
  verificationTokenExpiration: string;
};

const authShared = {
  tokenKey: 'eardrummersstrippersmikewillmikewillmadeit',
  verificationTokenExpiration: '30m',
};

export type EmailConfig =
  | ({ service: 'ethereal' } & EtherealEmailConfig)
  | ({ service: 'sendgrid' } & SendgridEmailConfig);

export type EtherealEmailConfig = typeof etherealEmail;
export type SendgridEmailConfig = typeof sendgridEmail;

const etherealEmail = {
  email: 'marquis.pacocha95@ethereal.email',
  password: '2RySqgyTQH5C9rxpMz',
};

const sendgridEmail = {
  apiKey:
    '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',
  verificationSenderEmail: 'rafa.sofizadeh@gmail.com',
};

export type MainConfig = {
  domain: string;
  nodeEnv: 'dev' | 'prod';
  stripe: StripeConfig;
  mongo: MongoConfig;
  cookie: CookieConfig;
  auth: AuthConfig;
  email: EmailConfig;
};

export default ((): MainConfig => {
  if (process.env.APP_ENV === 'dev') {
    return {
      // TODO: Variable port
      domain: 'http://localhost:3000',
      nodeEnv: 'dev',
      stripe: {
        ...stripeShared,
        apiKey:
          'sk_test_51HxT2gFkgohp7fDw87WrwV6gf2KdksQGq7F4UUsbQZ14OMW2Ce9svSCsu488HlK28cPJtAA1oElBgy2BHKXa58YK00yWEhc4UV',
        webhook: {
          ...stripeWebhookShared,
          secret: 'whsec_grimiP4UqqrcGgachhxrFPaaEnU7SMdp',
        },
        successPageUrl: 'https://news.ycombinator.com',
        cancelPageUrl: 'https://reddit.com',
      },
      mongo: {
        ...mongoShared,
        dbName: 'dev',
      },
      cookie: { ...cookieShared, cors: { secure: false, sameSite: 'lax' } },
      auth: { ...authShared },
      email: {
        service: 'ethereal',
        ...etherealEmail,
      },
    };
  }

  if (process.env.APP_ENV === 'prod') {
    const domain = 'https://aqueous-caverns-91110.herokuapp.com';

    return {
      // TODO: Variable port
      domain,
      nodeEnv: 'prod',
      stripe: {
        ...stripeShared,
        apiKey:
          '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',
        webhook: {
          ...stripeWebhookShared,
          secret: 'whsec_r2Y11qRPU3ZG07rB0c0bbQAxcwBuDxib',
        },
        successPageUrl: `${domain}/order/thank-you`,
        cancelPageUrl: `${domain}/order/error`,
      },
      mongo: {
        ...mongoShared,
        dbName: 'prod',
      },
      // Only 'SameSite=None; Secure' cookies are forwarded in third-party requests,
      // which is necessary in production to allow the front-end on domain X (see main.ts :: enableCors config)
      // to send request to server on domain Y:
      // https://stackoverflow.com/a/46412839/6539857
      // https://digiday.com/media/what-is-chrome-samesite/
      cookie: { ...cookieShared, cors: { secure: true, sameSite: 'none' } },
      auth: { ...authShared },
      email: {
        service: 'sendgrid',
        ...sendgridEmail,
      },
    };
  }

  throw new Error('No ENV passed');
})();
