import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User, UserRole } from 'src/users/entities/user.entity';
import { PostsService } from '../posts.service';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: User; params: { id: string } }>();
    const user: User = request.user;
    const postId = parseInt(request.params.id, 10);

    if (!user || !postId) {
      throw new ForbiddenException('Invalid request');
    }

    const post = await this.postsService.findById(postId);

    if (post.author.id === user.id || user.role === UserRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException('You can only modify your own posts');
  }
}
