import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // HABILITAR CORS CON EL PUERTO DE ANGULAR (4200)
  app.enableCors({
    origin: 'http://noli-chisme.vercel.app/',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // VALIDACIONES GLOBALES
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // SIRVIENDO ARCHIVOS ESTATICOS
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend corriendo en http://localhost:${port} AMOOOR`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
