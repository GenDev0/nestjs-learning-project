import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express'; // ✅ use Express Request type
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Post } from 'src/posts/entities/post.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { File } from 'src/file-upload/entities/file.entity';
import { CHECK_OWNERSHIP_KEY } from '../decorators/check-ownership.decorator';

type Resource = Post | User | File;

// Extend Request with our user
interface RequestWithUser extends Request {
  user?: { id: number; role: UserRole };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OwnershipGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private readonly entityMap: Record<
    string,
    (id: string) => Promise<Resource>
  > = {
    post: (id: string) => this.postsService.findById(Number(id)),
    user: (id: string) => this.usersService.findById(Number(id)),
    file: (id: string) => this.fileUploadService.getFileById(id),
  };

  private getOwnerId(resource: Resource): number | string | undefined {
    return (
      (resource as Post)?.author?.id ??
      (resource as File)?.uploader?.id ??
      (resource as User)?.id
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const entity = this.reflector.get<string>(CHECK_OWNERSHIP_KEY, handler);

    if (!entity) return true; // skip if no @CheckOwnership

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // 🔎 params are always strings in Express
    const rawId =
      request.params.id ??
      request.params.postId ??
      request.params.userId ??
      request.params.fileId;

    if (!user || !rawId) {
      throw new ForbiddenException(
        'Invalid ownership check: missing user or id',
      );
    }

    const loader = this.entityMap[entity];
    if (!loader) {
      throw new ForbiddenException(`Unsupported ownership entity: ${entity}`);
    }

    const resource = await loader(rawId);
    if (!resource) {
      throw new ForbiddenException(`${entity} with id ${rawId} not found`);
    }

    const ownerId = this.getOwnerId(resource);

    if (ownerId === user.id || user.role === UserRole.ADMIN) {
      this.logger.log(
        `✅ Access granted for user ${user.id} on ${entity} ${rawId}`,
      );
      return true;
    }

    this.logger.warn(
      `❌ Access denied for user ${user.id} on ${entity} ${rawId} (owner: ${ownerId})`,
    );
    throw new ForbiddenException('You are not the owner of this resource');
  }
}
