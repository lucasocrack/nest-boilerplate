import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
}

@Injectable()
export class ResponseFormatInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  private getStandardMessage(statusCode: number): string {
    const statusMessages = {
      200: 'O raro momento em que tudo funciona',
      201: 'Criado. E você jurando que não ia dar certo',
      204: 'OK, mas sem resposta... tipo ghosting',
      301: 'Mudou de endereço, mas te avisa',
      302: 'Mudou temporariamente (vida de nômade)',
    };

    return statusMessages[statusCode] || 'Operação realizada com sucesso';
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;

        // Se já é uma resposta formatada, não reformatar
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Para status 204, não retornar data
        if (statusCode === 204) {
          return {
            statusCode,
            message: this.getStandardMessage(statusCode),
            timestamp: new Date().toISOString(),
          };
        }

        return {
          statusCode,
          message: this.getStandardMessage(statusCode),
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
