import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { CustomExceptionFilter } from './order/infrastructure/rest-api/nest-infrastructure/CustomExceptionFilter';

// TODO(GLOBAL) More expressive UseCases with Order types/stages
// TODO(GLOBAL): Rethink everything related to event emitting; email notifications & maybe server-sent events

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
