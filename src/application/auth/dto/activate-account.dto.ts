import { IsString } from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  token: string;
}
