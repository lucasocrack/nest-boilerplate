import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../log.service';
import { DataSanitizer } from '../../../core/utils/data-sanitizer';

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

      // Sanitiza dados sensíveis antes de logar
      const sanitizedDetails = DataSanitizer.sanitizeHttpRequest({
        body,
        params,
        query,
        headers: req.headers,
      });

      this.logService.createLog({
        route: originalUrl,
        method,
        user: user ? { connect: { userId: (user as any).userId } } : undefined,
        details: sanitizedDetails,
      });
    });

    next();
  }
}
