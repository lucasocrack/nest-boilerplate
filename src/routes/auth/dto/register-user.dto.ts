import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/.*/, {
    message: 'password is too weak',
  })
  password: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  cpfCnpj?: string;

  @IsBoolean()
  @ApiProperty({ type: 'boolean' })
  terms: boolean;
}
