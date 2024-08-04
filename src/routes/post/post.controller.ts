import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { ExcludeRoles } from '../../decorators/exclude-roles.decorator';
import { Role } from '@prisma/client';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard('jwt'))
  @ExcludeRoles(Role.CLIENT)
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(createPostDto);
  }
}
