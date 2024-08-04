import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: CreatePostDto) {
    try {
      // @ts-ignore
      return await this.prisma.post.create({ data });
    } catch (error) {
      throw new InternalServerErrorException('Error creating post');
    }
  }
}