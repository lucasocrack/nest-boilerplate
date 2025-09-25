import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  Matches,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsCpf } from '../../../core/validators/cpf.validator';

/**
 * DTO para criação administrativa de usuários
 * Permite definir role, status ativo e outros campos privilegiados
 * Deve ser usado apenas em rotas protegidas por autenticação ADMIN
 */
export class CreateUserAdminDto {
  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'admin_user',
    minLength: 3,
    maxLength: 30,
  })
  @IsString({ message: 'Nome de usuário deve ser uma string' })
  @IsNotEmpty({ message: 'Nome de usuário é obrigatório' })
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  @MaxLength(30, {
    message: 'Nome de usuário deve ter no máximo 30 caracteres',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nome de usuário deve conter apenas letras, números e underscore',
  })
  userName: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Administrador Sistema',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Email válido para comunicação',
    example: 'admin@empresa.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha forte com pelo menos 8 caracteres',
    example: 'AdminSenh@123',
    minLength: 8,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'CPF válido (opcional)',
    example: '123.456.789-01',
  })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @IsCpf({ message: 'CPF inválido' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Telefone para contato (opcional)',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Matches(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/, {
    message: 'Telefone deve ter um formato válido (ex: (11) 99999-9999)',
  })
  telefone?: string;

  @ApiPropertyOptional({
    description: 'URL do avatar do usuário (opcional)',
    example: 'https://exemplo.com/avatar.jpg',
  })
  @IsOptional()
  @IsString({ message: 'URL do avatar deve ser uma string' })
  @IsUrl({}, { message: 'URL do avatar deve ser uma URL válida' })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Nível de acesso do usuário',
    enum: Role,
    example: 'ADMIN',
  })
  @IsEnum(Role, {
    message: 'Role deve ser um valor válido (USER, ADMIN, GERENTE)',
  })
  role: Role;

  @ApiPropertyOptional({
    description: 'Se o usuário deve estar ativo imediatamente',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active deve ser um valor booleano' })
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Se deve enviar email de ativação',
    example: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'SendEmail deve ser um valor booleano' })
  sendEmail?: boolean;
}
