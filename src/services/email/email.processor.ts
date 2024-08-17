import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const { user } = job.data;
    const context = {
      name: user.username,
      activationLink: `http://localhost:4200/activate?token=${user.activationToken}`,
    };

    await this.emailService.sendActivationEmail(user.email, context);
  }
}