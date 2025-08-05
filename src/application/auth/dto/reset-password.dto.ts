import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'A confirmação da senha deve ter pelo menos 8 caracteres',
  })
  passwordConfirmation: string;
}
