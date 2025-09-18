import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfiguration from './common/config/env.configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import {
  // ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
// import { APP_GUARD } from '@nestjs/core';
import { FileUploadModule } from './file-upload/file-upload.module';
import { APP_GUARD } from '@nestjs/core';
import { OwnershipGuard } from './common/guards/ownership.guard';
import { GuardsModule } from './common/guards/guards.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
      load: [envConfiguration],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30000, // milliseconds
      max: 100, // maximum number of items in cache
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // or your database type
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL') || 60000,
            limit: config.get<number>('THROTTLE_LIMIT') || 5,
          },
        ],
      }),
    }),
    PostsModule,
    AuthModule,
    UsersModule,
    FileUploadModule,
    CommonModule,
    GuardsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnershipGuard, // global guard
    },
  ],
})
export class AppModule {}
