import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { IsCpf } from '../../../core/validators';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @IsCpf({ message: 'CPF inválido' })
  cpf?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Matches(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/, {
    message: 'Telefone deve ter um formato válido (ex: (11) 99999-9999)',
  })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'URL do avatar deve ser uma string' })
  @IsUrl({}, { message: 'URL do avatar deve ser uma URL válida' })
  avatarUrl?: string;
}
