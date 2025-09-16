import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto';

export class PostsQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString({ message: 'Title  must be a string' })
  @MaxLength(100, {
    message: 'Title cannot be longer than 100 characters',
  })
  title?: string;
}
