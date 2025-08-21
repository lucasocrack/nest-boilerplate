import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email ou CPF é obrigatório' })
  @IsString({ message: 'Email ou CPF deve ser uma string' })
  identification: string;

  @IsNotEmpty({ message: 'Password é obrigatório' })
  @IsString({ message: 'Password deve ser uma string' })
  password: string;
}
