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
import { PostFilters } from './interfaces/post.interface';
import { CreatePostDto } from './dto/crate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistPipe } from './pipes/post-exist.pipe';
import { Post as PostEntity } from './entities/post.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() filters: PostFilters): Promise<PostEntity[]> {
    return this.postsService.findWithFilters(filters);
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
  update(
    @Param('id', ParseIntPipe, PostExistPipe) existingPost: PostEntity,
    @Body(RemoveUndefinedPipe) createPostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(existingPost, createPostDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.postsService.delete(id, user);
  }
}
