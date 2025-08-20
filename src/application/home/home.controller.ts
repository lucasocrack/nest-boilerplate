import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import { Response } from 'express';
import { IsPublic } from '../../core/decorators/is-public.decorator';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @IsPublic()
  getHome(@Res() res: Response) {
    res.send(this.homeService.getHome());
  }

  @Get('test-api')
  @IsPublic()
  testApi() {
    return {
      message: 'API funcionando',
      timestamp: new Date().toISOString(),
      data: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

}
