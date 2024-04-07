import { IsString } from 'class-validator'

export class CreateCertificateDto {
  @IsString()
  readonly name: string
  @IsString()
  readonly description: string
  @IsString()
  readonly cnpj: string
  @IsString()
  readonly usercreated: string
}
