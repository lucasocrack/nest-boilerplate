import {
  IsNotEmpty,
  IsString,
  MinLength,
  Length,
  Matches,
} from 'class-validator';
import { Match } from '../../../core/validators/match.validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token de reset é obrigatório' })
  @Length(64, 64, {
    message: 'Token de reset deve ter exatamente 64 caracteres',
  })
  token: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  })
  password: string;

  @IsString({ message: 'Confirmação da senha deve ser uma string' })
  @IsNotEmpty({ message: 'Confirmação da senha é obrigatória' })
  @Match('password', { message: 'As senhas não coincidem' })
  passwordConfirmation: string;
}
