import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let error = 'Internal Server Error';

    // Log do erro para debugging
    this.logger.error(exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;
        message = response.message || exception.message;
        error = response.error || exception.name;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Erros não HTTP (ex: erros de validação do Prisma)
      message = exception.message;
      error = exception.name;

      // Tratar erros específicos do Prisma
      if (exception.name === 'PrismaClientKnownRequestError') {
        const prismaError = exception as any;
        
        if (prismaError.code === 'P2002') {
          status = HttpStatus.CONFLICT;
          message = 'Dados já existem no sistema';
          error = 'Conflict';
        } else if (prismaError.code === 'P2025') {
          status = HttpStatus.NOT_FOUND;
          message = 'Registro não encontrado';
          error = 'Not Found';
        }
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
