import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-auth.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
