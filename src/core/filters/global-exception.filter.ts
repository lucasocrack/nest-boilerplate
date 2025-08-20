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
    
    return statusMessages[statusCode] || 'Algo deu errado, mas não sabemos o quê';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let error = 'Internal Server Error';
    let useStandardMessage = true; // Usar mensagens padronizadas por padrão

    // Log do erro para debugging
    this.logger.error(exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;
        // Usar mensagem padrão se useStandardMessage for true, senão usar específica
        if (useStandardMessage || !response.message || response.message === exception.name) {
          message = this.getStandardMessage(status);
        } else {
          message = response.message;
        }
        error = response.error || exception.name;
      } else {
        // Usar mensagem padrão se useStandardMessage for true
        if (useStandardMessage || exceptionResponse === exception.name || !exceptionResponse) {
          message = this.getStandardMessage(status);
        } else {
          message = exceptionResponse as string;
        }
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
      } else {
        // Para outros erros, usar mensagem padrão baseada no status
        message = this.getStandardMessage(status);
        useStandardMessage = true;
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
