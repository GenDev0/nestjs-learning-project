import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from 'src/common/hashing/hasing.service';
import { CreateUserResult, UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {}

  async login({ email, password: userPassword }: LoginDto): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isPasswordValid = await this.hashingService.compareValue(
        userPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      const tokens = this.hashingService.generateTokens(userWithoutPassword);
      return {
        ...tokens,
        user: userWithoutPassword,
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: CreateUserResult }> {
    const newUser = await this.usersService.create(registerDto);
    return { message: 'Registration successful', user: newUser };
  }

  async createAdmin(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: CreateUserResult }> {
    const newUser = await this.usersService.createAdmin(registerDto);
    return { message: 'Registration successful', user: newUser };
  }
}
