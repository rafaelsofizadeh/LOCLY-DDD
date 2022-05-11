"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyIdentity = exports.AnyEntityIdentity = exports.AnyHostIdentity = exports.UnverifiedHostIdentity = exports.AnonymousIdentity = exports.VerifiedHostIdentity = exports.CustomerIdentity = exports.VerificationTokenIdentity = void 0;
const common_1 = require("@nestjs/common");
const error_handling_1 = require("../../common/error-handling");
const Identity_1 = require("../entity/Identity");
function identityDecoratorFactory(...allowedIdentityTypes) {
    return function (_, ctx) {
        const { identity, } = ctx.switchToHttp().getRequest();
        if (identity === undefined) {
            (0, error_handling_1.throwCustomException)('No identity provided', undefined, common_1.HttpStatus.UNAUTHORIZED)();
        }
        if (!allowedIdentityTypes.includes(identity.type)) {
            (0, error_handling_1.throwCustomException)('Invalid identity', {
                allowedIdentityTypes,
                providedIdentityType: identity.type,
            }, common_1.HttpStatus.UNAUTHORIZED)();
        }
        return identity.entity;
    };
}
exports.VerificationTokenIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.VerificationToken));
exports.CustomerIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.Customer));
exports.VerifiedHostIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.Host));
exports.AnonymousIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.Anonymous));
exports.UnverifiedHostIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.UnverifiedHost));
exports.AnyHostIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.UnverifiedHost, Identity_1.IdentityType.Host));
exports.AnyEntityIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.UnverifiedHost, Identity_1.IdentityType.Host, Identity_1.IdentityType.Customer));
exports.AnyIdentity = (0, common_1.createParamDecorator)(identityDecoratorFactory(Identity_1.IdentityType.Anonymous, Identity_1.IdentityType.UnverifiedHost, Identity_1.IdentityType.Host, Identity_1.IdentityType.Customer));
//# sourceMappingURL=IdentityDecorator.js.map