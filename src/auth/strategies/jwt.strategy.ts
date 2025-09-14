import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { EnvConfig } from 'src/common/config/env.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService<EnvConfig>,
  ) {
    const secret =
      configService.get('jwt.accessTokenSecret', { infer: true }) ||
      'defaultAccessSecret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: number }) {
    try {
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        return null;
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
