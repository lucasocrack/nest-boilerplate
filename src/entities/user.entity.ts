import { Role } from '@prisma/client';

export class User {
  id: string;
  email: string;
  username: string;
  cpfCnpj?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
  activatedAt?: Date;
  activateIp?: string;
  terms: boolean;
  role: Role;
  personId?: number;
}
