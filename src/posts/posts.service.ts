import { Injectable, NotFoundException } from '@nestjs/common';
import { PostInterface, PostFilters } from './interfaces/post.interface';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/crate-post.dto';

@Injectable()
export class PostsService {
  private posts: PostInterface[] = [
    {
      id: 1,
      title: 'First Post',
      content: 'This is the content of the first post.',
      authorName: 'John Doe',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'This is the content of the second post.',
      authorName: 'Jane Smith',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2),
    },
    {
      id: 3,
      title: 'Third Post',
      content: 'This is the content of the third post.',
      authorName: 'Alice Johnson',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3),
    },
  ];

  findAll(): PostInterface[] {
    return this.posts || [];
  }
  findById(id: number): PostInterface {
    const post = this.posts.find((post) => post.id === id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    // Return a shallow copy to avoid mutation
    return post;
  }
  create(post: CreatePostDto): PostInterface {
    const newPost = {
      ...post,
      id: this.getNextId(),
      createdAt: new Date(),
    };
    this.posts.push(newPost);
    return newPost;
  }
  update(id: number, post: UpdatePostDto): PostInterface {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    const updatedPost = {
      ...this.posts[index],
      ...post,
      updatedAt: new Date(),
    };
    console.log(
      '🚀 ~ PostsService ~ update ~ updatedPost.this.posts[index]:',
      this.posts[index],
    );
    console.log('🚀 ~ PostsService ~ update ~ updatedPost:', updatedPost);
    this.posts[index] = updatedPost;
    return updatedPost;
  }
  delete(id: number): { message: string } {
    const index = this.posts.findIndex((post) => post.id === id);
    if (index === -1) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    this.posts.splice(index, 1);
    return { message: `Post with id ${id} deleted successfully` };
  }

  findWithFilters(filters: PostFilters) {
    let result = this.posts; // Or use a query builder if using TypeORM, Prisma, etc.

    if (filters?.author) {
      result = result.filter((post) =>
        post.authorName.toLowerCase().includes(filters.author!.toLowerCase()),
      );
    }
    if (filters?.title) {
      result = result.filter((post) =>
        post.title.toLowerCase().includes(filters.title!.toLowerCase()),
      );
    }
    if (filters?.content) {
      result = result.filter((post) =>
        post.content.toLowerCase().includes(filters.content!.toLowerCase()),
      );
    }
    if (filters?.startDate != null && filters?.endDate != null) {
      result = result.filter((post) => {
        const date = new Date(post.createdAt);
        const start =
          filters.startDate instanceof Date
            ? filters.startDate
            : new Date(filters.startDate as unknown as string | number);
        const end =
          filters.endDate instanceof Date
            ? filters.endDate
            : new Date(filters.endDate as unknown as string | number);
        return date >= start && date <= end;
      });
    }

    return result;
  }

  private getNextId(): number {
    return this.posts.length > 0
      ? Math.max(...this.posts.map((post) => post.id)) + 1
      : 1;
  }
}
