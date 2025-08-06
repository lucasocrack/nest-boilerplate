import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user: User;
}
