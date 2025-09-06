import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from 'src/common/hashing/hashing.service';
import { CreateUserResult, UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {}

  async login({ email, password: enteredPassword }: LoginDto): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (
      !user ||
      !(await this.hashingService.compareValue(enteredPassword, user.password))
    ) {
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

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; data: CreateUserResult }> {
    return this.handleUserCreation(registerDto, UserRole.USER);
  }

  async createAdmin(
    registerDto: RegisterDto,
  ): Promise<{ message: string; data: CreateUserResult }> {
    return this.handleUserCreation(registerDto, UserRole.ADMIN);
  }

  private async handleUserCreation(
    registerDto: RegisterDto,
    role: UserRole,
  ): Promise<{ message: string; data: CreateUserResult }> {
    const { username, email, password } = registerDto;

    if (!username || !email || !password) {
      throw new BadRequestException('Missing required fields.');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const hashedPassword = await this.hashingService.hashValue(password);

    const savedUser = await this.usersService.createUserEntity({
      ...registerDto,
      password: hashedPassword,
      role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = savedUser;
    const tokens = this.hashingService.generateTokens(userWithoutPassword);

    return {
      message: 'Registration successful',
      data: {
        user: userWithoutPassword,
        ...tokens,
      },
    };
  }
}
