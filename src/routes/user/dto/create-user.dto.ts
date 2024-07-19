import { User } from '../entities/user.entity';
import {
  IsDateString,
  IsEmail, IsEnum, IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../enums/roles.enum';

export class CreateUserDto extends User {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;
}
