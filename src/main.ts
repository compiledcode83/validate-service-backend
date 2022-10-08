import { NestFactory } from '@nestjs/core';
import { AppBootstrapManager } from './app-bootstrap.manager';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  AppBootstrapManager.setAppDefaults(app);

  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
