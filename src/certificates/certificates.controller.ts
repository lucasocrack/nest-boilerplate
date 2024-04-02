import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('certificates')
export class CertificatesController {
  @Get('all')
  findAll() {
    return 'Retorna todos os certificasdos';
  }
  @Get('id-:id')
  findOne(@Param('id') id: string) {
    return `Curso #${id}`;
  }
  @Get('cnpj-:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return `CNPJ #${cnpj}`;
  }
  @Post()
  create(@Body('name') body ) {
    return body;
  }
}
