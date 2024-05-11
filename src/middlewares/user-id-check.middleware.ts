import { Request, Response, NextFunction } from 'express';
import { NestMiddleware, BadRequestException } from '@nestjs/common';

export class UserIdCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Checando ID do usuário...');
    if (isNaN(Number(req.params.id)) || Number(req.params.id) <= 0) {
      throw new BadRequestException('O ID deve ser um número.');
    }

    next();
  }
}
