import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      return request.user;
    } else {
      throw new NotFoundException('User not found');
    }
    return request.user;
  },
);
