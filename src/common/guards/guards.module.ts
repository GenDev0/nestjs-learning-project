import { Module } from '@nestjs/common';
import { OwnershipGuard } from './ownership.guard';
import { PostsModule } from 'src/posts/posts.module';
import { UsersModule } from 'src/users/users.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [PostsModule, UsersModule, FileUploadModule],
  providers: [OwnershipGuard],
  exports: [OwnershipGuard],
})
export class GuardsModule {}
