import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  token: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/.*/, {
    message: 'senha muito fraca',
  })
  @ApiProperty()
  newPassword: string;
}
