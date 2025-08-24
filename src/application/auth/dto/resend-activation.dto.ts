import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendActivationDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}
