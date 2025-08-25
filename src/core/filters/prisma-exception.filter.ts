import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library';

interface PrismaErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  code?: string;
}

/**
 * Filtro específico para tratar erros do Prisma ORM
 * Converte códigos de erro do Prisma em respostas HTTP apropriadas
 */
@Catch(
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let error = 'Internal Server Error';
    let code: string | undefined;

    // Log do erro para debugging
    this.logger.error(`Erro do Prisma: ${exception.message}`, exception.stack);

    if (exception instanceof PrismaClientKnownRequestError) {
      code = exception.code;

      switch (exception.code) {
        case 'P2002':
          // Violação de constraint única
          status = HttpStatus.CONFLICT;
          message = this.getUniqueConstraintMessage(exception);
          error = 'Conflict';
          break;

        case 'P2025':
          // Registro não encontrado
          status = HttpStatus.NOT_FOUND;
          message = 'Registro não encontrado';
          error = 'Not Found';
          break;

        case 'P2003':
          // Violação de foreign key
          status = HttpStatus.BAD_REQUEST;
          message = 'Referência inválida - registro relacionado não existe';
          error = 'Bad Request';
          break;

        case 'P2014':
          // Violação de relação obrigatória
          status = HttpStatus.BAD_REQUEST;
          message = 'Operação inválida - violação de relação obrigatória';
          error = 'Bad Request';
          break;

        case 'P2021':
          // Tabela não existe
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Erro de configuração do banco de dados';
          error = 'Internal Server Error';
          break;

        case 'P2022':
          // Coluna não existe
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Erro de configuração do banco de dados';
          error = 'Internal Server Error';
          break;

        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Erro na operação do banco de dados';
          error = 'Database Error';
      }
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Dados inválidos fornecidos';
      error = 'Validation Error';
    } else if (exception instanceof PrismaClientInitializationError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro de conexão com o banco de dados';
      error = 'Database Connection Error';
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro desconhecido no banco de dados';
      error = 'Unknown Database Error';
    }

    const errorResponse: PrismaErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(code && { code }),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Gera mensagem específica para erros de constraint única
   */
  private getUniqueConstraintMessage(
    exception: PrismaClientKnownRequestError,
  ): string {
    const target = exception.meta?.target as string[];

    if (target && target.length > 0) {
      const field = target[0];

      switch (field) {
        case 'email':
          return 'Este email já está sendo usado por outro usuário';
        case 'userName':
          return 'Este nome de usuário já está sendo usado';
        case 'cpf':
          return 'Este CPF já está cadastrado no sistema';
        default:
          return `O campo ${field} já existe no sistema`;
      }
    }

    return 'Dados já existem no sistema';
  }
}
