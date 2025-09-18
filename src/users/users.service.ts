import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEventsService } from 'src/events/listeners/user-events.service';

export interface CreateUserResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userEventsService: UserEventsService,
  ) {}

  async createUserEntity(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    const createdUser = await this.userRepository.save(user);
    // Emit user registered event
    this.userEventsService.emitUserRegisteredEvent(createdUser);

    return createdUser;
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
    this.userEventsService.emitUserUpdatedEvent(updatedUser);
    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    await this.userRepository.remove(user);
    this.userEventsService.emitUserDeletedEvent(user);
    return { message: 'User deleted successfully.' };
  }
}
