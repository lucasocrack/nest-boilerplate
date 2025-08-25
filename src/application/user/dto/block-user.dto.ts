import { IsOptional, IsISO8601, IsString } from 'class-validator';
import { IsFutureDate } from '../../../core/validators';

export class BlockUserDto {
  @IsOptional()
  @IsString({ message: 'Data de bloqueio deve ser uma string' })
  @IsISO8601(
    { strict: true },
    {
      message:
        'blockedUntil deve ser uma data ISO válida (ex: 2025-08-11T12:00:00.000Z)',
    },
  )
  @IsFutureDate({ message: 'Data de bloqueio deve ser no futuro' })
  blockedUntil?: string; // ISO string, ex: 2025-08-11T12:00:00.000Z
}
