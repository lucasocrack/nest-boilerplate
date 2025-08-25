import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ActivateAccountDto {
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token de ativação é obrigatório' })
  @Length(64, 64, {
    message: 'Token de ativação deve ter exatamente 64 caracteres',
  })
  token: string;
}
