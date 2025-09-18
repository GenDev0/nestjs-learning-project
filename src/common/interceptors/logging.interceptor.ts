import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class Logginginterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `User ${user.email} is doing ${method} on ${url} - at ${now} for ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
