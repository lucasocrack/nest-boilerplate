import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Se não for pública, verificar JWT
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token de acesso é obrigatório',
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
      } as any);
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        username: string;
        tokenVersion?: number;
      }>(token);

      // validar tokenVersion atual com o usuário
      const user = await this.prisma.user.findUnique({
        where: { userId: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }
      if (
        typeof payload.tokenVersion === 'number' &&
        payload.tokenVersion !== user.tokenVersion
      ) {
        throw new UnauthorizedException(
          'Token invalidado. Faça login novamente.',
        );
      }

      request.user = {
        userId: payload.sub,
        userName: payload.username,
        tokenVersion: user.tokenVersion,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Token de acesso inválido ou expirado',
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
      } as any);
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
