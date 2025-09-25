import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from 'jsonwebtoken';

/**
 * Filtro específico para capturar e formatar erros de autenticação e autorização
 * Trata exceções relacionadas a JWT, acesso negado e credenciais inválidas
 */
@Catch(UnauthorizedException, ForbiddenException, JsonWebTokenError)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  catch(
    exception: UnauthorizedException | ForbiddenException | JsonWebTokenError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let error: string;

    // Log do erro para auditoria de segurança
    this.logger.warn(`Erro de autenticação/autorização:`, {
      type: exception.constructor.name,
      message: exception.message,
      url: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'] || 'unknown',
      ip: (request as any).ip,
    });

    if (exception instanceof UnauthorizedException) {
      statusCode = 401;
      error = 'Unauthorized';

      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse['message']
      ) {
        message = exceptionResponse['message'];
      } else {
        message = 'Credenciais inválidas ou token de acesso necessário';
      }
    } else if (exception instanceof ForbiddenException) {
      statusCode = 403;
      error = 'Forbidden';

      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse['message']
      ) {
        message = exceptionResponse['message'];
      } else {
        message = 'Acesso negado - permissões insuficientes';
      }
    } else if (exception instanceof JsonWebTokenError) {
      statusCode = 401;
      error = 'Unauthorized';

      if (exception instanceof TokenExpiredError) {
        message = 'Token de acesso expirado - faça login novamente';
      } else if (exception instanceof NotBeforeError) {
        message = 'Token ainda não é válido';
      } else {
        message = 'Token de acesso inválido ou malformado';
      }
    } else {
      // Fallback para outros tipos de erro de autenticação
      statusCode = 401;
      message = 'Erro de autenticação';
      error = 'Authentication Error';
    }

    const errorResponse = {
      success: false,
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }
}
