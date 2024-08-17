import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { TokenUtils } from '../../routes/auth/utils/token.utils';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly tokenUtils: TokenUtils,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const { user } = job.data;
    const activationLink = this.tokenUtils.generateActivationLink(user.id);
    const context = {
      name: user.username,
      activationLink,
    };

    await this.emailService.sendActivationEmail(user.email, context);
  }
}
