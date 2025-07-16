import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PostsService } from '../posts.service';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostExistPipe implements PipeTransform {
  constructor(private readonly postsService: PostsService) {}
  async transform(value: number, metadata: ArgumentMetadata): Promise<Post> {
    if (!value || metadata.data !== 'id') {
      throw new Error('Post ID is required');
    }
    const post = await this.postsService.findById(value);
    if (!post) {
      throw new Error(`Post with id ${value} not found`);
    }
    console.log('🚀 ~ PostExistPipe ~ transform ~ post:', post);

    // Here you would typically check if the post exists in the database
    // For example:
    // const post = await this.postsService.findById(value.id);
    // if (!post) {
    //   throw new NotFoundException(`Post with id ${value.id} not found`);
    // }
    return post;
  }
}
