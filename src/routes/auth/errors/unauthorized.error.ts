import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedError extends HttpException {
  constructor(message: string, statusCode: number = HttpStatus.UNAUTHORIZED) {
    super(message, statusCode);
  }
}
