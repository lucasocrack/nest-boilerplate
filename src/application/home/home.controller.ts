import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import { Response } from 'express';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHome(@Res() res: Response) {
    res.send(this.homeService.getHome());
  }

}
