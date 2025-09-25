import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from 'jsonwebtoken';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private getStandardMessage(statusCode: number): string {
    const statusMessages = {
      200: 'O raro momento em que tudo funciona',
      201: 'Criado. E você jurando que não ia dar certo',
      204: 'OK, mas sem resposta... tipo ghosting',
      301: 'Mudou de endereço, mas te avisa',
      302: 'Mudou temporariamente (vida de nômade)',
      400: 'A culpa é do usuário. Sempre',
      401: 'Você não tem permissão, jovem gafanhoto',
      403: 'Mesmo com permissão, não entra',
      404: 'O clássico: só existe em produção',
      429: 'Muitas requisições (rate limiting ativo)',
      500: 'Hora de culpar a infra',
      501: 'Ainda não implementado (e talvez nunca seja)',
      502: 'O servidor surtou, tente mais tarde',
      503: 'O serviço decidiu tirar férias',
      504: 'O servidor está te ignorando',
    };

    return (
      statusMessages[statusCode] || 'Algo deu errado, mas não sabemos o quê'
    );
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let error = 'Internal Server Error';
    let details: any = undefined;
    let useStandardMessage = false; // Preferir mensagens específicas

    // Log do erro para debugging
    this.logger.error(`Erro capturado pelo GlobalExceptionFilter:`, {
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      url: request.url,
      method: request.method,
    });

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || this.getStandardMessage(status);
        error = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        message = exceptionResponse || this.getStandardMessage(status);
        error = exception.name;
      }
    } else if (exception instanceof JsonWebTokenError) {
      // Tratar erros de JWT
      status = HttpStatus.UNAUTHORIZED;
      error = 'Unauthorized';

      if (exception instanceof TokenExpiredError) {
        message = 'Token de acesso expirado';
      } else if (exception instanceof NotBeforeError) {
        message = 'Token ainda não é válido';
      } else {
        message = 'Token de acesso inválido';
      }
    } else if (exception instanceof TypeError) {
      // Erros de tipo (geralmente bugs no código)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor';
      error = 'Type Error';
      useStandardMessage = true;
    } else if (exception instanceof SyntaxError) {
      // Erros de sintaxe (JSON malformado, etc.)
      status = HttpStatus.BAD_REQUEST;
      message = 'Formato de dados inválido';
      error = 'Syntax Error';
    } else if (exception instanceof Error) {
      // Outros erros genéricos
      message = exception.message || 'Erro desconhecido';
      error = exception.name || 'Unknown Error';

      if (this.isBadRequestError(exception)) {
        status = HttpStatus.BAD_REQUEST;
        error = 'Bad Request';
      } else {
        useStandardMessage = true;
      }
    } else {
      // Exceções que não são Error objects
      message = 'Erro desconhecido';
      error = 'Unknown Error';
      useStandardMessage = true;
    }

    // Usar mensagem padrão se solicitado
    if (useStandardMessage) {
      message = this.getStandardMessage(status);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Verifica se o erro deve ser tratado como Bad Request
   */
  private isBadRequestError(exception: Error): boolean {
    const badRequestPatterns = [
      'ValidationError',
      'CastError',
      'MongoError',
      'MulterError',
    ];

    return badRequestPatterns.some(
      (pattern) =>
        exception.name.includes(pattern) || exception.message.includes(pattern),
    );
  }
}
