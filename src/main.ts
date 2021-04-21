import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

// TODO(GLOBAL): "not found document" handling application-wide.
// TODO(GLOBAL): Rename "session" and create type alias for "mongo.ClientSession"
// TODO(GLOBAL): Should repo methods have sessions integrated into the methods? I think not, they should throw
// exceptions and withTransactionExplicitAbort should catch those exceptions and abort the session
// TODO(GLOBAL): Transient session between ConfirmOrder and FinalizeOrder
// TODO(GLOBAL): Add state transition control for Orders
// TODO(GLOBAL): Test event emission

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
