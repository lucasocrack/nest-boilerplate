import { IsEmail } from 'class-validator';

export class ResendActivationDto {
  @IsEmail()
  email: string;
}
