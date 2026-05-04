import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
      const details = errors.map((err) => {
        const constraints = Object.values(err.constraints || {}).join(', ');
        return `${err.property} ${constraints}`;
      });
      return new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    },
  }));
  await app.listen(3000);
}
bootstrap();
