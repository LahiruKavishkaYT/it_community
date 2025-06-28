import { IsString, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(10, { message: 'Feedback content must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Feedback content cannot exceed 1000 characters' })
  content: string;

  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
} 