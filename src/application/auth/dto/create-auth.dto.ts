import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';
import { IsCpf } from '../../../core/validators/cpf.validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nome de usuário deve conter apenas letras, números e underscore',
  })
  userName: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsCpf({ message: 'CPF inválido' })
  cpf?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
