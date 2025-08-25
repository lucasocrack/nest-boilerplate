import { HttpException, HttpStatus } from '@nestjs/common';

interface CustomErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Requisição inválida') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Não autorizado') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Acesso negado') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.FORBIDDEN,
      message,
      error: 'Forbidden',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Recurso não encontrado') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'Not Found',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.NOT_FOUND);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflito nos dados') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'Conflict',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.CONFLICT);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message: string = 'Dados não puderam ser processados') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message,
      error: 'Unprocessable Entity',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Erro interno do servidor') {
    const response: CustomErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    };

    super(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
