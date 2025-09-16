import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostFilters } from './interfaces/post.interface';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/crate-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PostsQueryDto } from './dto/posts-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination-response.interface';

@Injectable()
export class PostsService {
  private readonly postsListCacheKey: Set<string> = new Set();

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generatePostsListCacheKey(filters: PostsQueryDto): string {
    const { page = 1, limit = 2, title } = filters;
    return `posts_list_page:${page}_limit:${limit}_title:${title || 'all'}`;
  }

  async findAll(query: PostsQueryDto): Promise<PaginatedResponse<Post>> {
    const cacheKey = this.generatePostsListCacheKey(query);
    this.postsListCacheKey.add(cacheKey);
    const cachedData =
      await this.cacheManager.get<PaginatedResponse<Post>>(cacheKey);

    if (cachedData) {
      console.log('🚀 ~ PostsService ~ findAll ~ cachedData:', cachedData);
      return cachedData;
    }
    console.log('🚀 ~ PostsService ~ findAll ~ No cachedData: Hitting DB');

    const { page = 1, limit = 2, title } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (title) {
      queryBuilder.andWhere('LOWER(post.title) LIKE :title', {
        title: `%${title.toLowerCase()}%`,
      });
    }

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const meta = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const response: PaginatedResponse<Post> = { data, meta };

    await this.cacheManager.set(cacheKey, response, 30000); // Cache for 3 minutes

    return response;
  }

  async findAllOld(): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
    return posts;
  }

  async findById(id: number): Promise<Post> {
    const cacheKey = `post_id:${id}`;
    this.postsListCacheKey.add(cacheKey);
    const cachedPost = await this.cacheManager.get<Post>(cacheKey);
    if (cachedPost) {
      console.log('🚀 ~ PostsService ~ findById ~ cachedPost:', cachedPost);
      return cachedPost;
    }
    console.log('🚀 ~ PostsService ~ findById ~ No cached - HIT DB');

    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    await this.cacheManager.set(cacheKey, post, 30000); // Cache for 3 minutes
    return post;
  }

  async create(post: CreatePostDto, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({
      ...post,
      author: user,
    });
    // Invalidate all cached posts list
    await this.clearAllCache();
    return this.postsRepository.save(newPost);
  }

  async update(
    existingPost: Post,
    updatePostDto: UpdatePostDto,
    // user: User,
  ): Promise<Post> {
    // The authorization logic is commented out , it's now handled by the Ownership guard
    // if (existingPost.author.id !== user.id && user.role !== UserRole.ADMIN) {
    //   throw new ForbiddenException('You can only edit your own posts');
    // }
    const updatedPost = this.postsRepository.merge(existingPost, updatePostDto);
    // Invalidate cache for this post
    const postCacheKey = `post_id:${existingPost.id}`;
    await this.cacheManager.del(postCacheKey);
    // Invalidate all cached posts list
    await this.clearAllCache();
    return this.postsRepository.save(updatedPost);
  }

  async delete(
    id: number,
    // user: User
  ): Promise<{ message: string }> {
    // The authorization logic is commented out , it's now handled by the Ownership guard
    // const post = await this.findById(id);

    // if (post.author.id !== user.id && user.role !== UserRole.ADMIN) {
    //   throw new ForbiddenException('You can only delete your own posts');
    // }
    // await this.postsRepository.remove(post);
    // return { message: `Post with id ${id} deleted successfully` };
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    // Invalidate cache for this post
    const postCacheKey = `post_id:${id}`;
    await this.cacheManager.del(postCacheKey);
    // Invalidate all cached posts list
    await this.clearAllCache();
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

  // Invalidates all cached posts list and individual post caches
  private async clearAllCache() {
    console.log(
      '🚀 ~ PostsService ~ clearAllCache ~ ',
      this.postsListCacheKey.size,
    );
    for (const key of this.postsListCacheKey) {
      await this.cacheManager.del(key);
    }
    this.postsListCacheKey.clear();
  }
}
