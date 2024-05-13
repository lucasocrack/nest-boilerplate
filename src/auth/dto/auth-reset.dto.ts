import { MinLength, IsString, IsJWT } from 'class-validator';

export class AuthResetDto {
  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsJWT()
  readonly token: string;
}
