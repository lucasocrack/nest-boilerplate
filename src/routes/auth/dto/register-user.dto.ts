import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/.*/, {
    message: 'senha muito fraca',
  })
  password: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  cpf?: string;

  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  @IsOptional()
  role?: Role;
}
