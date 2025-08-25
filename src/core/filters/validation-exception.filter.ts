import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details: string[];
  timestamp: string;
  path: string;
}

/**
 * Filtro específico para tratar erros de validação do class-validator
 * Captura BadRequestException e formata as mensagens de validação
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    // Log do erro para debugging
    this.logger.warn(
      `Erro de validação na rota ${request.url}:`,
      exception.getResponse(),
    );

    const exceptionResponse = exception.getResponse() as any;
    let validationErrors: string[] = [];

    // Extrair mensagens de validação
    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      validationErrors = exceptionResponse.message;
    } else if (typeof exceptionResponse.message === 'string') {
      validationErrors = [exceptionResponse.message];
    } else {
      validationErrors = ['Dados de entrada inválidos'];
    }

    const errorResponse: ValidationErrorResponse = {
      statusCode: status,
      message: 'Erro de validação nos dados fornecidos',
      error: 'Validation Error',
      details: validationErrors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
