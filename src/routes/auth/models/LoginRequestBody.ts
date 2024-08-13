import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestBody {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
