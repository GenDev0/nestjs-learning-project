import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExistsPipe } from './pipes/user-exists.pipe';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe, UserExistsPipe) existingUser: User) {
    // return this.usersService.findById(existingUser);
    return existingUser;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe, UserExistsPipe) existingUser: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(existingUser, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
