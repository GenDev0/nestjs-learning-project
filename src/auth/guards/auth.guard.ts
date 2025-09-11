import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    // Implement your authentication logic here
    const request: Request = context.switchToHttp().getRequest();
    const token: string | undefined = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    if (typeof token !== 'string') {
      throw new UnauthorizedException('Invalid token type');
    }
    try {
      const jwtConfig = this.configService.get<{
        accessTokenExpiration: string;
        refreshTokenExpiration: string;
        accessTokenSecret: string;
        refreshTokenSecret: string;
      }>('jwt') as
        | {
            accessTokenExpiration: string;
            refreshTokenExpiration: string;
            accessTokenSecret: string;
            refreshTokenSecret: string;
          }
        | undefined;
      const secret = jwtConfig?.accessTokenSecret ?? 'defaultAccessSecret';
      const payload: Record<string, any> = await this.jwtService.verifyAsync(
        token,
        {
          secret,
        },
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true; // Allow access for demonstration purposes
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
