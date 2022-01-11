export type AppConfig = typeof config;

const config = (() => ({
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
    payoutDelayDays: 10,
  },
}))();

export default config;
