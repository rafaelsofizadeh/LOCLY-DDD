import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

// TODO(GLOBAL): https://github.com/microsoft/TypeScript/issues/2845
// TODO(GLOBAL): https://stackoverflow.com/a/37300663/6539857 !!!
// TODO(GLOBAL): "not found document" handling application-wide.

/**
TOOD(GLOBAL):
Introduce polymorphism to the code, remove the “status” property, make every status a separate subclass
Use mixins and composition to form the classes
Move service functionality to the Domain Entities themselves
*/

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
