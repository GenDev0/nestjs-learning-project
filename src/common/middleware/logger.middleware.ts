import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;
    this.logger.log(
      `[Incoming] ${method} ${originalUrl} - ${userAgent} - ${ip}`,
    );
    req['startTime'] = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - req['startTime'];
      this.logger.log(
        `[Outgoing] ${method} ${originalUrl} ${statusCode} ${contentLength || 0} - ${responseTime}ms`,
      );
    });

    next();
  }
}
