"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_1 = __importStar(require("./secrets"));
exports.default = (() => {
    const shared = (domain) => ({
        domain,
        nodeEnv: process.env.APP_ENV,
        stripe: {
            apiKey: secrets_1.default.stripe.apiKey,
            successPageUrl: `${domain}/order/thank-you`,
            cancelPageUrl: `${domain}/order/error`,
            apiVersion: '2020-08-27',
            webhook: {
                path: 'stripe/webhook',
                secret: secrets_1.default.stripe.webhookSecret,
            },
        },
        cookie: {
            authIndicatorName: 'auth',
            tokenName: 'token',
            tokenExpiration: '7d',
        },
        auth: {
            tokenKey: secrets_1.default.authTokenKey,
            verificationTokenExpiration: '30m',
            authTokenExpiration: '7d',
        },
        mongo: { connectionString: secrets_1.default.mongoConnectionString },
        email: secrets_1.default.email,
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
        const sharedConfig = shared('https://locky.vercel.app');
        return {
            ...sharedConfig,
            mongo: {
                ...sharedConfig.mongo,
                dbName: 'prod',
            },
            cookie: {
                ...sharedConfig.cookie,
                cors: { secure: true, sameSite: 'none' },
            },
        };
    }
    throw new Error('No ENV passed');
})();
//# sourceMappingURL=app.configuration.js.map