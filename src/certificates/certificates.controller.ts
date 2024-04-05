import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) { }
  @Get()
  findAll(@Res() response) {
    return this.certificatesService.findAll();
  }
  @Get('id-:id')
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }
  @Get('cnpj-:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.certificatesService.findByCnpj(cnpj);
  }
  @Post()
  create(@Body() body ) {
    return this.certificatesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.certificatesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
