import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class HashingService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Hashes a value using bcrypt.
   * @param value The value to hash.
   * @returns The hashed value.
   */
  async hashValue(value: string): Promise<string> {
    return await bcrypt.hash(value, 12);
  }

  /**
   * Compares a plain text password with a hashed value.
   * @param plainValue The plain text value.
   * @param hashedValue The hashed value to compare against.
   * @returns True if the values match, false otherwise.
   */
  async compareValue(
    plainValue: string,
    hashedValue: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainValue, hashedValue);
  }

  /**
   * Generates Tokens for logged in user.
   * @param user The User returned from User entity.
   * @returns A promise that resolves to accessToken and refreshToken.
   */
  generateTokens(user: Omit<User, 'password'>): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const jwtConfig = this.configService.get<{
      accessTokenExpiration: string;
      refreshTokenExpiration: string;
      accessTokenSecret: string;
      refreshTokenSecret: string;
    }>('jwt');

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig?.accessTokenExpiration || '15m',
      secret: jwtConfig?.accessTokenSecret || 'defaultAccessSecret',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig?.refreshTokenExpiration || '7d',
      secret: jwtConfig?.refreshTokenSecret || 'defaultRefreshSecret',
    });
    return { accessToken, refreshToken };
  }
}
