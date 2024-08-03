import { Role } from '@prisma/client';

export class UserFromJwt {
  id: string;
  email: string;
  username: string;
  role: Role;
}
