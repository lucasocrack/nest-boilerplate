import { IsOptional, IsISO8601 } from 'class-validator';

export class BlockUserDto {
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'blockedUntil deve ser uma data ISO válida' })
  blockedUntil?: string; // ISO string, ex: 2025-08-11T12:00:00.000Z
}
