import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'src/common/hashing/hasing.service';

export interface CreateUserResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResult> {
    const { username, email, password: userPassword } = createUserDto;

    if (!username || !email || !userPassword) {
      throw new BadRequestException('Missing required fields.');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const hashedPassword = await this.hashingService.hashValue(userPassword);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
    });
    const savedUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedUser;
    const tokens = this.hashingService.generateTokens(userWithoutPassword);
    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }
  async createAdmin(createUserDto: CreateUserDto): Promise<CreateUserResult> {
    const { username, email, password: userPassword } = createUserDto;

    if (!username || !email || !userPassword) {
      throw new BadRequestException('Missing required fields.');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const hashedPassword = await this.hashingService.hashValue(userPassword);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    const savedUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedUser; // Exclude password from the response
    const tokens = this.hashingService.generateTokens(userWithoutPassword);
    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password, ...userWithoutPassword }) => userWithoutPassword,
    );
  }

  async findById(id: number): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = existingUser; // Exclude password from the response

    return this.userRepository.save(userWithoutPassword); // Return user without password
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async update(
    existingUser: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = this.userRepository.merge(existingUser, updateUserDto);
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully.' };
  }
}
