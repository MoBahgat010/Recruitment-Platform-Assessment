import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      
      if (exceptionResponse?.error?.code === 'VALIDATION_ERROR') {
        return response.status(status).json(exceptionResponse);
      }

      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse.message || 'An error occurred');
      
      if (status === HttpStatus.NOT_FOUND) {
        code = 'NOT_FOUND';
      } else if (status === HttpStatus.BAD_REQUEST) {
        code = 'BAD_REQUEST';
      }
    } else {
        console.error(exception);
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
      }
    });
  }
}
