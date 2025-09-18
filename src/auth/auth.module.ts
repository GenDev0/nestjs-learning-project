import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthGuard } from './guards/auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { RolesGuard } from './guards/roles.guard';
import { EventsModule } from 'src/events/events.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
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
    EventsModule,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
