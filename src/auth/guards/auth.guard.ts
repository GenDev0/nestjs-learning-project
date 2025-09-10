import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
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
