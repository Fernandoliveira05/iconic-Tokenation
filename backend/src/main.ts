// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // 0) Carrega variáveis de ambiente
  dotenv.config();

  // 1) Cria a aplicação Nest
  const app = await NestFactory.create(AppModule);

  // 2) CORS (deve vir antes de qualquer outro middleware)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://iconic-seven.vercel.app',
      'https://iconicxp.netlify.app',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Transaction-Id'],
    credentials: false,
  });

  // 3) GZIP compression
  app.use(compression());

  // 4) Validação global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 5) Swagger setup
  const config = new DocumentBuilder()
    .setTitle('ICONIC API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 6) Inicializa o servidor na porta do ambiente (Render define PORT)
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
}

bootstrap();
