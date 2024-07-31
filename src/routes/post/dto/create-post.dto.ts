import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  published: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  productDescription: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  linkAffiliate: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  authorId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tags: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  date: Date;
}
