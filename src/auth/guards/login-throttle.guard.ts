import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const body = req.body as Record<string, any> | undefined;
    const email =
      typeof body === 'object' &&
      body !== null &&
      typeof body?.email === 'string'
        ? body.email
        : 'anonymous';
    return await Promise.resolve(`${req.ip}-${email}`);
  }
  // set limits for 5 login attempts
  protected getRequestLimit(): Promise<number> {
    return Promise.resolve(5);
  }

  // set time to live for 1 minute
  protected getRequestTtl(): Promise<number> {
    return Promise.resolve(60000); // 1 minute
  }

  // throw error message when limit is reached
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      `Too many login attempts. Please try again after 1 minute.`,
    );
  }
}
