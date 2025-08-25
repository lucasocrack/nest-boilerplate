import { HttpStatus } from '@nestjs/common';

/**
 * Helper para criar respostas padronizadas com mensagens divertidas
 */
export class ResponseHelper {
  private static getStandardMessage(statusCode: number): string {
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

    return statusMessages[statusCode] || 'Operação realizada com sucesso';
  }

  /**
   * Cria uma resposta de sucesso padronizada
   */
  static success<T>(
    data: T,
    statusCode: number = HttpStatus.OK,
    customMessage?: string,
  ) {
    return {
      statusCode,
      message: customMessage || this.getStandardMessage(statusCode),
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cria uma resposta de sucesso para criação
   */
  static created<T>(data: T, customMessage?: string) {
    return this.success(data, HttpStatus.CREATED, customMessage);
  }

  /**
   * Cria uma resposta sem conteúdo
   */
  static noContent(customMessage?: string) {
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: customMessage || this.getStandardMessage(HttpStatus.NO_CONTENT),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cria uma resposta personalizada
   */
  static custom<T>(statusCode: number, data?: T, customMessage?: string) {
    const response: any = {
      statusCode,
      message: customMessage || this.getStandardMessage(statusCode),
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      response.data = data;
    }

    return response;
  }
}

/**
 * Para exemplos detalhados de uso, consulte: docs/RESPONSE_HELPER.md
 */
