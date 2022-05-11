"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_configuration_1 = require("./app.configuration");
const etherealEmail = {
    service: 'ethereal',
    email: 'marquis.pacocha95@ethereal.email',
    password: '2RySqgyTQH5C9rxpMz',
};
const mailchimpEmail = etherealEmail;
exports.default = (() => {
    const sharedSecrets = {
        mongoConnectionString: 'mongodb+srv://rafasofizada:kYXzceja1C8KcUDR@locly.tcrn6.mongodb.net',
        authTokenKey: '5md4QEjVRabkGfq0hxp3',
    };
    if (process.env.APP_ENV === 'dev') {
        return {
            stripe: {
                apiKey: 'sk_test_51HxT2gFkgohp7fDw87WrwV6gf2KdksQGq7F4UUsbQZ14OMW2Ce9svSCsu488HlK28cPJtAA1oElBgy2BHKXa58YK00yWEhc4UV',
                webhookSecret: 'whsec_grimiP4UqqrcGgachhxrFPaaEnU7SMdp',
            },
            email: etherealEmail,
            ...sharedSecrets,
        };
    }
    if (process.env.APP_ENV === 'prod') {
        return {
            stripe: {
                apiKey: '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',
                webhookSecret: 'whsec_r2Y11qRPU3ZG07rB0c0bbQAxcwBuDxib',
            },
            email: mailchimpEmail,
            ...sharedSecrets,
        };
    }
    throw new Error('No ENV passed');
})();
//# sourceMappingURL=secrets.js.map