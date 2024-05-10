import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePutUserDto extends PartialType(CreateUserDto) {}

export class UpdatePatchUserDto {}
