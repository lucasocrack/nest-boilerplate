import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsPublic } from '../../core/decorators/is-public.decorator';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @IsPublic()
  @ApiOperation({ summary: 'Obter informações da API' })
  @ApiResponse({
    status: 200,
    description: 'Informações básicas da API retornadas com sucesso',
  })
  getHome(@Res() res: Response) {
    res.send(this.homeService.getHome());
  }

  @Get('test-api')
  @IsPublic()
  @ApiOperation({ summary: 'Testar conectividade da API' })
  @ApiResponse({ status: 200, description: 'API funcionando corretamente' })
  testApi() {
    return {
      message: 'API funcionando',
      timestamp: new Date().toISOString(),
      data: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }
}
