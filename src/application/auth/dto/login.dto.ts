import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Username é obrigatório' })
  @IsString({ message: 'Username deve ser uma string' })
  username: string;

  @IsNotEmpty({ message: 'Password é obrigatório' })
  @IsString({ message: 'Password deve ser uma string' })
  password: string;
}
