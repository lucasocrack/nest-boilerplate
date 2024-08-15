import { UserService } from '../../user/user.service';
import { UnauthorizedError } from '../errors/unauthorized.error';

export class ValidationUtils {
  constructor(private readonly userService: UserService) {}

  async validateUniqueEmail(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new UnauthorizedError('Email já está em uso.', 400);
    }
  }

  async validateUniqueUsername(username: string) {
    const user = await this.userService.findOneByUsername(username);
    if (user) {
      throw new UnauthorizedError('Username já está em uso.', 400);
    }
  }

  async validateUniqueCpfCnpj(cpfCnpj: string) {
    if (!cpfCnpj) {
      return;
    }
    const user = await this.userService.findOneByCpfCnpj(cpfCnpj);
    if (user) {
      throw new UnauthorizedError('CPF/CNPJ já está em uso.', 400);
    }
  }
}
