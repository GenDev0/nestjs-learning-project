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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostFilters } from './interfaces/post.interface';
import { CreatePostDto } from './dto/crate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistPipe } from './pipes/post-exist.pipe';
import { Post as PostEntity } from './entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() filters: PostFilters): Promise<PostEntity[]> {
    return this.postsService.findWithFilters(filters);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe, PostExistPipe) id: number,
    @Body(RemoveUndefinedPipe) createPostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, createPostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.delete(id);
  }
}
