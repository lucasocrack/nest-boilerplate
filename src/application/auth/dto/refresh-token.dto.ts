import { IsNotEmpty, IsString, IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  @IsJWT({ message: 'Refresh token deve ter um formato JWT válido' })
  refreshToken: string;
}
