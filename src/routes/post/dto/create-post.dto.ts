import { IsString, IsBoolean, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsBoolean()
  published: boolean;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  date: Date;

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
  productCategory: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  linkAffiliate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  authorId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tags: string;
}
