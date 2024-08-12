import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InactiveUserService } from './inactive-user.service';

@Injectable()
export class InactiveUserScheduler {
  constructor(private readonly inactiveUserService: InactiveUserService) {}

  async onModuleInit() {
    await this.inactiveUserService.deleteInactiveUsers();
  }

  @Cron('0 * * * *')
  async handleCron() {
    await this.inactiveUserService.deleteInactiveUsers();
  }
}
