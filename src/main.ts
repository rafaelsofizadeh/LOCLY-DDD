import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

// TODO(GLOBAL): https://github.com/microsoft/TypeScript/issues/2845
// TODO(GLOBAL): default values in constructor or in parameters?
// TODO(GLOBAL): https://stackoverflow.com/a/37300663/6539857 !!!

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
