import { Controller, Get } from '@nestjs/common';

@Controller("users")
export class UsersController {
  @Get()
  findAll(): string {
    return "listagem de usuários";
  }
}
