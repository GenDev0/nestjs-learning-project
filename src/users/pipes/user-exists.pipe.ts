import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserExistsPipe implements PipeTransform {
  constructor(private readonly usersService: UsersService) {}

  async transform(value: number, metadata: ArgumentMetadata): Promise<User> {
    if (!value || metadata.data !== 'id') {
      throw new Error('Post ID is required');
    }
    if (isNaN(value)) {
      throw new NotFoundException(`Invalid user ID: ${value}`);
    }
    // Check if the user exists
    const user = await this.usersService.findById(value);

    if (!user) {
      throw new NotFoundException(`User with ID ${value} not found`);
    }
    return user;
  }
}
