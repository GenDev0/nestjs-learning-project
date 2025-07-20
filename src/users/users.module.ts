import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserExistsPipe } from './pipes/user-exists.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Assuming User is an entity imported from entities/user.entity.ts
  ],
  controllers: [UsersController],
  providers: [UsersService, UserExistsPipe],
  exports: [UsersService],
})
export class UsersModule {}
