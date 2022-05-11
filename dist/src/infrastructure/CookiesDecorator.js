"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookies = void 0;
const common_1 = require("@nestjs/common");
exports.Cookies = (0, common_1.createParamDecorator)((prop, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return prop ? request.cookies?.[prop] : request.cookies;
});
//# sourceMappingURL=CookiesDecorator.js.map