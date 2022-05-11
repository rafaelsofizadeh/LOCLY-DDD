"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupNestApp = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const AppModule_1 = require("./AppModule");
const CustomExceptionFilter_1 = require("./infrastructure/CustomExceptionFilter");
function setupNestApp(app) {
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalFilters(new CustomExceptionFilter_1.CustomExceptionFilter());
}
exports.setupNestApp = setupNestApp;
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule_1.AppModule, {
        bodyParser: false
    });
    setupNestApp(app);
    await app.listen(process.env.PORT || 3000);
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
//# sourceMappingURL=main.js.map