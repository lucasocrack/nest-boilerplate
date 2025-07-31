import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogService } from '../../services/log.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
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
