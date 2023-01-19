import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppBootstrapManager } from './app-bootstrap.manager';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  AppBootstrapManager.setAppDefaults(app);

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'Api-Key' })
    .addServer('https://api.valicit.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
