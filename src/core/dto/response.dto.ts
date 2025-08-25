import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({ description: 'Indica se a operação foi bem-sucedida' })
  success: boolean;

  @ApiProperty({ description: 'Mensagem descritiva da resposta' })
  message: string;

  @ApiProperty({ description: 'Dados da resposta', required: false })
  data?: T;

  @ApiProperty({ description: 'Timestamp da resposta' })
  timestamp: string;

  @ApiProperty({ description: 'Código de status HTTP' })
  statusCode: number;

  constructor(data?: T, message?: string, statusCode: number = 200) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message =
      message ||
      (this.success ? 'Operação realizada com sucesso' : 'Erro na operação');
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.statusCode = statusCode;
  }
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Indica que houve erro', example: false })
  success: boolean = false;

  @ApiProperty({ description: 'Mensagem de erro' })
  message: string;

  @ApiProperty({ description: 'Código de erro', required: false })
  error?: string;

  @ApiProperty({ description: 'Detalhes do erro', required: false })
  details?: any;

  @ApiProperty({ description: 'Timestamp do erro' })
  timestamp: string;

  @ApiProperty({ description: 'Código de status HTTP' })
  statusCode: number;

  constructor(
    message: string,
    statusCode: number,
    error?: string,
    details?: any,
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}
