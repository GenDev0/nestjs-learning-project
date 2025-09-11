import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserResult } from 'src/users/users.service';
import { AuthGuard } from './guards/auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    loginDto: LoginDto,
  ): Promise<any> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; data: CreateUserResult }> {
    return this.authService.register(registerDto);
  }

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; data: CreateUserResult }> {
    return this.authService.createAdmin(registerDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: any }): any {
    return req.user;
  }
}
