import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../log.service';
import { DataSanitizer } from '../../../core/utils/data-sanitizer';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logService: LogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const originalSend: any = (res as any).send.bind(res);
    const { method, originalUrl, body, params, query, user }: any = req as any;

    (res as any).send = function (body: any): Response {
      return originalSend(body);
    };

    res.on('finish', () => {
      const { statusCode }: any = res as any;
      if (statusCode >= 400) {
        return; // Don't log client or server errors for now
      }

      // Sanitiza dados sensíveis antes de logar
      const sanitizedDetails: any = DataSanitizer.sanitizeHttpRequest({
        body: body,
        params: params,
        query: query,
        headers: (req as any).headers,
      });

      void this.logService.createLog({
        route: originalUrl,
        method: method,
        user: user
          ? { connect: { userId: (user as { userId: string }).userId } }
          : undefined,
        details: sanitizedDetails,
      });
    });

    next();
  }
}
