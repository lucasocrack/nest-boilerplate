import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) { }
  @Get()
  findAll(@Res() response) {
    return response.status(HttpStatus.OK).json({ message: 'All certificates' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  create(@Body('name') body ) {
    return body;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return `Atualizado o certificado ${body}`;
  }
}
