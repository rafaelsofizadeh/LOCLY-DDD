"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_handling_1 = require("../common/error-handling");
let CustomExceptionFilter = class CustomExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        console.error(exception?.error || 'Undefined error');
        return response?.status(exception?.status).json({
            message: `${common_1.HttpStatus[exception?.status]} | ${exception?.error.message}`,
            data: exception?.data,
        });
    }
};
CustomExceptionFilter = __decorate([
    (0, common_1.Catch)(error_handling_1.Exception)
], CustomExceptionFilter);
exports.CustomExceptionFilter = CustomExceptionFilter;
//# sourceMappingURL=CustomExceptionFilter.js.map