import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RestoreUserDto {
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  reason?: string; // Motivo da restauração
}
