import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class HashingService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
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

  /**
   * Generates Access Token for logged in user.
   * @param user The User returned from User entity.
   * @returns Access Token
   */
  generateAccessToken(user: Omit<User, 'password'>): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const jwtConfig = this.configService.get<{
      accessTokenExpiration: string;
      accessTokenSecret: string;
    }>('jwt');

    return this.jwtService.sign(payload, {
      expiresIn: jwtConfig?.accessTokenExpiration || '15m',
      secret: jwtConfig?.accessTokenSecret || 'defaultAccessSecret',
    });
  }

  /**
   * Generates Refresh Token for logged in user.
   * @param user The User returned from User entity.
   * @returns Refresh Token
   */
  generateRefreshToken(user: Omit<User, 'password'>): string {
    const payload = {
      sub: user.id,
    };
    const jwtConfig = this.configService.get<{
      refreshTokenExpiration: string;
      refreshTokenSecret: string;
    }>('jwt');

    return this.jwtService.sign(payload, {
      expiresIn: jwtConfig?.refreshTokenExpiration || '7d',
      secret: jwtConfig?.refreshTokenSecret || 'defaultRefreshSecret',
    });
  }

  /**
   * Refreshes the Access Token using the provided Refresh Token.
   * @param refreshToken The Refresh Token.
   * @returns A promise that resolves to a new Access Token.
   * @throws UnauthorizedException if the Refresh Token is invalid or expired.
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const jwtConfig = this.configService.get<{
        refreshTokenSecret: string;
      }>('jwt');
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: jwtConfig?.refreshTokenSecret || 'defaultRefreshSecret',
      });
      // Fetch the user from the database using payload.sub (user ID)
      // and verify if the user still exists or is active.
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token !');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
