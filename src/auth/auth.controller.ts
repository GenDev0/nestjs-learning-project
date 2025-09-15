import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserResult } from 'src/users/users.service';
// import { AuthGuard } from './guards/auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { RolesGuard } from './guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Public()
  async login(
    @Body()
    loginDto: LoginDto,
  ): Promise<any> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; data: CreateUserResult }> {
    return this.authService.register(registerDto);
  }

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async createAdmin(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; data: CreateUserResult }> {
    return this.authService.createAdmin(registerDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @Public()
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.authService.refreshToken(refreshToken);
  }

  // @UseGuards(AuthGuard)
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any): any {
    return user;
  }
}
