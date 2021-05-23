import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { CustomExceptionFilter } from './infrastructure/CustomExceptionFilter';

// TODO(GLOBAL): More expressive UseCases with Order types/stages
// TODO(GLOBAL): Rethink everything related to event emitting; email notifications & maybe server-sent events
// TODO(GLOBAL): Rethink order statuses and change status to "belongs-to-user" and "belongs-to-host"
// TODO(GLOBAL)(IMPORTANT): Query db documents only through uuid, and only then check additional properties, to improve
// query performance

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
