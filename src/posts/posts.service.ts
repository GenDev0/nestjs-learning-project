import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostFilters } from './interfaces/post.interface';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/crate-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
    return posts;
  }
  async findById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }
  async create(post: CreatePostDto, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({
      ...post,
      author: user,
    });
    return this.postsRepository.save(newPost);
  }
  async update(
    existingPost: Post,
    updatePostDto: UpdatePostDto,
    user: User,
  ): Promise<Post> {
    if (existingPost.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own posts');
    }
    const updatedPost = this.postsRepository.merge(existingPost, updatePostDto);
    return this.postsRepository.save(updatedPost);
  }
  async delete(id: number, user: User): Promise<{ message: string }> {
    const post = await this.findById(id);

    if (post.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.postsRepository.remove(post);
    return { message: `Post with id ${id} deleted successfully` };
  }

  async findWithFilters(filters: PostFilters): Promise<Post[]> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author');

    if (filters?.author) {
      query.andWhere('LOWER(author.username) LIKE :author', {
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
    // query.relation('author');
    // query.leftJoinAndSelect('post.author', 'author');
    query.orderBy('post.createdAt', 'DESC');
    return await query.getMany();
  }
}
