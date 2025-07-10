import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(2, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must not exceed 50 characters' })
  title: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @MinLength(2, { message: 'Content must be at least 10 characters long' })
  @MaxLength(500, { message: 'Content must not exceed 500 characters' })
  content: string;

  @IsNotEmpty({ message: 'Author is required' })
  @IsString({ message: 'Author must be a string' })
  @MinLength(2, { message: 'Author must be at least 3 characters long' })
  @MaxLength(50, { message: 'Author must not exceed 50 characters' })
  authorName: string;
}
