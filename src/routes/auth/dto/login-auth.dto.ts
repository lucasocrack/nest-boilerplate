import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @IsString()
  @ApiProperty()
  identifier: string;

  @IsString()
  @ApiProperty()
  password: string;
}
