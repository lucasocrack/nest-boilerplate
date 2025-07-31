import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../../services/log.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logService: LogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, params, query, user } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      if (statusCode >= 400) {
        return; // Don't log client or server errors for now
      }

      this.logService.createLog({
        route: originalUrl,
        method,
        user: user ? { connect: { userId: (user as any).userId } } : undefined,
        details: {
          body,
          params,
          query,
        },
      });
    });

    next();
  }
}
