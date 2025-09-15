import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostsService } from '../../posts/posts.service';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

interface RequestWithUser {
  user?: { id: number; role: UserRole };
  params: { id: string };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const id = parseInt(request.params.id, 10);

    const entity = this.reflector.get<string>(
      'checkOwnership',
      context.getHandler(),
    );

    if (!entity || !user || !id) {
      throw new ForbiddenException('Invalid ownership check');
    }

    let resource: Post | User | undefined;
    let ownerId: number | undefined;
    switch (entity) {
      case 'post':
        resource = await this.postsService.findById(id);
        ownerId = resource?.author?.id;
        break;
      case 'user':
        resource = await this.usersService.findById(id);
        ownerId = resource?.id;
        break;
      default:
        throw new ForbiddenException(`Unsupported ownership entity: ${entity}`);
    }

    if ((ownerId && ownerId === user.id) || user.role === UserRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException('You are not the owner of this resource');
  }
}
