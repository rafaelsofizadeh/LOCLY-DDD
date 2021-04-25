import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { CustomExceptionFilter } from './order/infrastructure/rest-api/CustomExceptionFilter';

// TODO(GLOBAL): "not found document" handling application-wide.
// TODO(GLOBAL) ^related: More expressive UseCases with Order types/stages
// TODO(GLOBAL): Error handling in all repo methods
// TODO(GLOBAL): Tie deleteOrder to removeOrderFromCustomer
// TODO(GLOBAL): Rethink everything related to event emitting

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
