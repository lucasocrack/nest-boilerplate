import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class MeUpdateUserDto extends User {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @MinLength(3)
  @MaxLength(20)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  @Matches(/.*/, {
    message: 'senha muito fraca',
  })
  password: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  cpfCnpj: string;
}
