import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature is used to register entities with TypeORM
    // This will be available in the current scope of the PostsModule
    // This will be available in the PostsService via dependency injection
    // This allows the PostsService to use the Post repository for database operations
    TypeOrmModule.forFeature([Post]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
