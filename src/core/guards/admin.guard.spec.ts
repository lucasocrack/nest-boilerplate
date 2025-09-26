import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard';
import { Role } from '@prisma/client';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createMockContext = (
      token?: string,
      role?: Role,
    ): ExecutionContext => {
      const request = {
        headers: {
          authorization: token ? `Bearer ${token}` : undefined,
        },
      };

      return {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;
    };

    it('should allow access for admin users', async () => {
      const mockContext = createMockContext('valid-token');
      mockReflector.getAllAndOverride.mockReturnValue(false); // Não é rota pública
      mockJwtService.verify.mockReturnValue({
        sub: 'user-id',
        role: Role.ADMIN,
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should deny access for non-admin users', async () => {
      const mockContext = createMockContext('valid-token');
      mockReflector.getAllAndOverride.mockReturnValue(false); // Não é rota pública
      mockJwtService.verify.mockReturnValue({
        sub: 'user-id',
        role: Role.CLIENTE,
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should deny access for users without token', async () => {
      const mockContext = createMockContext();
      mockReflector.getAllAndOverride.mockReturnValue(false); // Não é rota pública

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should deny access for invalid tokens', async () => {
      const mockContext = createMockContext('invalid-token');
      mockReflector.getAllAndOverride.mockReturnValue(false); // Não é rota pública
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token');
    });

    it('should allow access to public routes regardless of role', async () => {
      const mockContext = createMockContext();
      mockReflector.getAllAndOverride.mockReturnValue(true); // É rota pública

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should prevent privilege escalation attempts', async () => {
      const mockContext = createMockContext('manipulated-token');
      mockReflector.getAllAndOverride.mockReturnValue(false);

      // Simula tentativa de escalação de privilégios com token manipulado
      mockJwtService.verify.mockReturnValue({
        sub: 'user-id',
        role: 'SUPER_ADMIN', // Role inexistente
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });
});
