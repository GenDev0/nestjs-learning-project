import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'src/common/hashing/hasing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    if (!username || !email || !password) {
      throw new BadRequestException('Missing required fields.');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    const hashedPassword = this.hashingService.hashValue(password);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findById(id: number): Promise<User> {
    console.log('🚀 ~ UsersService ~ findById ~ id:', id);
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }
    return existingUser;
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
