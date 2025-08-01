import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.logService.findAll();
  }
}
