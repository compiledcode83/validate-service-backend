import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppBootstrapManager } from './app-bootstrap.manager';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  AppBootstrapManager.setAppDefaults(app);

  const config = new DocumentBuilder()
    .setTitle('Web backend')
    .setDescription('Web backend documentation')
    .setVersion('1.0')
    .addServer('https://web-api.valicit.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
