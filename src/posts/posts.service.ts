import { Injectable, NotFoundException } from '@nestjs/common';
import { PostFilters } from './interfaces/post.interface';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/crate-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    const posts = await this.postsRepository.find();
    return posts;
  }
  async findById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }
  async create(post: CreatePostDto): Promise<Post> {
    const newPost = this.postsRepository.create({
      ...post,
    });
    return this.postsRepository.save(newPost);
  }
  async update(existingPost: Post, post: UpdatePostDto): Promise<Post> {
    const updatedPost = this.postsRepository.merge(existingPost, post);
    return this.postsRepository.save(updatedPost);
  }
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return { message: `Post with id ${id} deleted successfully` };
  }

  async findWithFilters(filters: PostFilters): Promise<Post[]> {
    const query = this.postsRepository.createQueryBuilder('post');

    if (filters?.author) {
      query.andWhere('LOWER(post.authorName) LIKE :author', {
        author: `%${filters.author.toLowerCase()}%`,
      });
    }

    if (filters?.title) {
      query.andWhere('LOWER(post.title) LIKE :title', {
        title: `%${filters.title.toLowerCase()}%`,
      });
    }

    if (filters?.content) {
      query.andWhere('LOWER(post.content) LIKE :content', {
        content: `%${filters.content.toLowerCase()}%`,
      });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('post.createdAt BETWEEN :start AND :end', {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate),
      });
    }
    query.orderBy('post.createdAt', 'DESC');
    return await query.getMany();
  }
}
