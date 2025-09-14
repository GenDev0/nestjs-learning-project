import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @IsOptional()
  @IsArray({ message: 'Tags must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MinLength(3, {
    each: true,
    message: 'Each tag must be at least 3 character long',
  })
  @MaxLength(10, {
    each: true,
    message: 'Each tag must not exceed 10 characters',
  })
  tags: string[];
}
