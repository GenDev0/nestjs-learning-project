import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret:
          config.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
          'defaultAccessSecret',
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') || '15m',
        },
      }),
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
