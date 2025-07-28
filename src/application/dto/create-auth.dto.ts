import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Role } from '../../../generated/prisma';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
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
}
