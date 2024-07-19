import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/routes/user/entities/user.entity';
import { AuthRequest } from '../routes/auth/models/AuthRequest';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);
