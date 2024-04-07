import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Certificate } from './entities/certificate.entity';

@Injectable()
export class CertificatesService {
  private certificates : Certificate [] = [
    {
      id: 1,
      name: 'Certificado 1',
      description: 'Certificado de teste 1',
      cnpj: '123456789',
      createdAt: new Date(),
      validatedAt: new Date(),
      updatedAt: new Date(),
      usercreated: '1',
    },
    {
      id: 2,
      name: 'Certificado 2',
      description: 'Certificado de teste 2',
      cnpj: '987654321',
      createdAt: new Date(),
      validatedAt: new Date(),
      updatedAt: new Date(),
      usercreated: '2',
    },
  ];

  findAll() {
    return this.certificates;
  }

  findOne(id: string) {
    const certificate = this.certificates.find((certificate) => certificate.id === Number(id));

    if (!certificate) {
      throw new HttpException(
        `Certificate ID ${id} not found`,
        HttpStatus.NOT_FOUND
      )
    }

    return certificate;
  }

  findByCnpj(cnpj: string) {
    return this.certificates.find(certificate => certificate.cnpj === cnpj);
  }

  create(createCertificateDTO: any) {
    this.certificates.push(createCertificateDTO);
  }

  update(id: string, updateCertificateDTO: any) {
    const indexCertificate = this.certificates.findIndex(
      (certificate) => certificate.id === Number(id),
    );

    this.certificates[indexCertificate] = updateCertificateDTO;
  }

  remove(id: string) {
    const indexCertificate = this.certificates.findIndex(
      (certificate) => certificate.id === Number(id),
    );

    if (indexCertificate >= 0) {
      this.certificates.splice(indexCertificate, 1);
    }
  }
}
