import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendActivationEmailDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
