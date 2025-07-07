import { Injectable } from '@nestjs/common';
import { Post, PostFilters } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  private posts: Post[] = [
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

  findAll(): Post[] {
    return this.posts || [];
  }
  findById(id: number): Post | null {
    return this.posts.find((post) => post.id === id) ?? null;
  }
  create(post: Post): Post {
    const newPost = {
      ...post,
      id: this.posts.length + 1,
      createdAt: new Date(),
    };
    this.posts.push(newPost);
    return newPost;
  }
  update(id: number, post: Post): Post | null {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    const updatedPost = {
      ...this.posts[index],
      ...post,
      updatedAt: new Date(),
    };
    this.posts[index] = updatedPost;
    return updatedPost;
  }
  delete(id: number): boolean {
    const index = this.posts.findIndex((post) => post.id === id);
    if (index === -1) {
      return false;
    }
    this.posts.splice(index, 1);
    return true;
  }

  findWithFilters(filters: PostFilters) {
    console.log('🚀 ~ PostsService ~ findWithFilters ~ filters:', filters);
    let result = this.posts; // Or use a query builder if using TypeORM, Prisma, etc.

    if (filters?.author) {
      console.log(
        '🚀 ~ PostsService ~ findWithFilters ~ filters?.author:',
        filters?.author,
      );
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
}
