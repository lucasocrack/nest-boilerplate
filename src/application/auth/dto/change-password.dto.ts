import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Match } from '../../../core/validators';

export class ChangePasswordDto {
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  })
  newPassword: string;

  @IsString({ message: 'Confirmação da nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Confirmação da nova senha é obrigatória' })
  @Match('newPassword', { message: 'As senhas não coincidem' })
  confirmNewPassword: string;
}
