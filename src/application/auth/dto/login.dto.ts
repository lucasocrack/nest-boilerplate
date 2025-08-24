import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Email ou CPF deve ser uma string' })
  @IsNotEmpty({ message: 'Email ou CPF é obrigatório' })
  identification: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(1, { message: 'Senha não pode estar vazia' })
  password: string;
}
