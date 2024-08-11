import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum, IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
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
  cpfCnpj: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  role: Role;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  updatedAt: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  deletedAt: Date;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: true })
  isActive: boolean = true;

  @IsInt()
  @IsOptional()
  @ApiProperty()
  personId: number;
}
