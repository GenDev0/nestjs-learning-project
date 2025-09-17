import { RemoveUndefinedPipe } from './../common/pipes/remove-undefined.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/crate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistPipe } from './pipes/post-exist.pipe';
import { Post as PostEntity } from './entities/post.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
// import { PostOwnerGuard } from './guards/post-owner.guard';
// import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { PostsQueryDto } from './dto/posts-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination-response.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: PostsQueryDto,
  ): Promise<PaginatedResponse<PostEntity>> {
    console.log('🚀 ~ PostsController ~ findAll ~ query:', query);

    return this.postsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(createPostDto, user);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  @CheckOwnership('post')
  update(
    @Param('id', ParseIntPipe, PostExistPipe) existingPost: PostEntity,
    @Body(RemoveUndefinedPipe) createPostDto: UpdatePostDto,
    // @CurrentUser() user: User,
  ) {
    return this.postsService.update(existingPost, createPostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  @CheckOwnership('post')
  delete(
    @Param('id', ParseIntPipe) id: number,
    // @CurrentUser() user: User
  ) {
    return this.postsService.delete(id);
  }
}
