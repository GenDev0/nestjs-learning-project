import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(2, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must not exceed 50 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  @MinLength(2, { message: 'Content must be at least 10 characters long' })
  @MaxLength(500, { message: 'Content must not exceed 500 characters' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  @MinLength(2, { message: 'Author must be at least 3 characters long' })
  @MaxLength(50, { message: 'Author must not exceed 50 characters' })
  authorName?: string;
}
