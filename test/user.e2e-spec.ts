import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { PrismaService } from '../src/core/config/prisma.service';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;
  let adminUser: User;
  let regularUser: User;
  let accessToken: string;
  let regularUserToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create admin user for authentication
    const hashedPassword = await bcrypt.hash('password123', 10);
    adminUser = await prisma.user.create({
      data: {
        userName: 'admin-user-e2e',
        name: 'Admin User',
        email: 'admin-e2e@example.com',
        password: hashedPassword,
        role: Role.ADMIN,
        active: true,
        tokenVersion: 1,
      },
    });

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identification: 'admin-e2e@example.com',
        password: 'password123',
      });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed with status ${loginResponse.status}`);
    }

    accessToken = (loginResponse.body as { data: { access_token: string } })
      .data.access_token;

    const regularUserPassword = await bcrypt.hash('password123', 10);
    regularUser = await prisma.user.create({
      data: {
        userName: 'regular-user-e2e',
        name: 'Regular User',
        email: 'regular-e2e@example.com',
        password: regularUserPassword,
        role: Role.CLIENTE,
        active: true,
        tokenVersion: 1,
      },
    });

    const regularLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identification: 'regular-e2e@example.com',
        password: 'password123',
      });

    if (regularLoginResponse.status !== 200) {
      throw new Error(
        `Regular user login failed with status ${regularLoginResponse.status}`,
      );
    }

    regularUserToken = (
      regularLoginResponse.body as { data: { access_token: string } }
    ).data.access_token;
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        userName: 'testuser-for-user-e2e',
        name: 'Test User',
        email: 'testuser-e2e@example.com',
        password: hashedPassword,
      },
    });
  });

  afterEach(async () => {
    if (prisma && adminUser && regularUser) {
      await prisma.user.deleteMany({
        where: {
          userId: {
            notIn: [adminUser.userId, regularUser.userId],
          },
        },
      });
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({});
    }
    if (app) {
      await app.close();
    }
  });

  describe('/users (GET)', () => {
    it('should return an array of users', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect((res.body as { data: any }).data).toHaveProperty('data');
          expect(
            (res.body as { data: { data: any } }).data.data,
          ).toBeInstanceOf(Array);
          expect((res.body as { data: { data: any[] } }).data.data.length).toBe(
            2,
          ); // admin + regular user
          expect((res.body as { data: any }).data).toHaveProperty('total');
          expect((res.body as { data: any }).data).toHaveProperty('page');
          expect((res.body as { data: any }).data).toHaveProperty('limit');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a single user', async () => {
      return request(app.getHttpServer())
        .get(`/users/${user.userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect((res.body as { data: any }).data).toBeDefined();
          expect(
            (res.body as { data: { userName: any } }).data.userName,
          ).toEqual(user.userName);
        });
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      const newName = 'Updated Test User';
      return request(app.getHttpServer())
        .patch(`/users/${user.userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: newName })
        .expect(200)
        .then((res) => {
          expect((res.body as { data: any }).data).toBeDefined();
          expect((res.body as { data: { name: any } }).data.name).toEqual(
            newName,
          );
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should soft delete a user', async () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(async () => {
          const deletedUser = await prisma.user.findUnique({
            where: { userId: user.userId },
          });
          expect(deletedUser).not.toBeNull();
          expect(deletedUser!.deletedAt).not.toBeNull();
        });
    });
  });

  describe('Security Tests - Authorization', () => {
    describe('/users/admin (POST)', () => {
      const createUserAdminDto = {
        userName: 'admin-created-user',
        name: 'Admin Created User',
        email: 'admin-created@example.com',
        password: 'password123',
        role: 'ADMIN',
        active: true,
      };

      it('should allow admin to create user via admin endpoint', async () => {
        return request(app.getHttpServer())
          .post('/users/admin')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createUserAdminDto)
          .expect(201)
          .then((res) => {
            expect((res.body as { data: any }).data).toBeDefined();
            expect(
              (res.body as { data: { userName: any } }).data.userName,
            ).toEqual(createUserAdminDto.userName);
            expect((res.body as { data: { role: any } }).data.role).toEqual(
              createUserAdminDto.role,
            );
            expect((res.body as { data: { active: any } }).data.active).toEqual(
              createUserAdminDto.active,
            );
          });
      });

      it('should deny regular user access to admin endpoint', async () => {
        return request(app.getHttpServer())
          .post('/users/admin')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send(createUserAdminDto)
          .expect(403)
          .then((res) => {
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Acesso negado');
          });
      });

      it('should deny unauthenticated access to admin endpoint', async () => {
        return request(app.getHttpServer())
          .post('/users/admin')
          .send(createUserAdminDto)
          .expect(401);
      });

      it('should deny access with invalid token to admin endpoint', async () => {
        return request(app.getHttpServer())
          .post('/users/admin')
          .set('Authorization', 'Bearer invalid-token')
          .send(createUserAdminDto)
          .expect(401);
      });
    });

    describe('Privilege Escalation Prevention', () => {
      it('should not allow regular user to access any admin-only routes', async () => {
        const adminOnlyRoutes = [{ method: 'post', path: '/users/admin' }];

        for (const route of adminOnlyRoutes) {
          const response = await request(app.getHttpServer())
            [route.method](route.path)
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send({});

          expect([401, 403]).toContain(response.status);
        }
      });

      it('should validate that regular user cannot escalate privileges through token manipulation', async () => {
        // Tentar acessar com token modificado (simulação de ataque)
        const maliciousToken = regularUserToken.replace(/.$/, 'X'); // Modifica último caractere

        return request(app.getHttpServer())
          .post('/users/admin')
          .set('Authorization', `Bearer ${maliciousToken}`)
          .send({
            userName: 'malicious-user',
            name: 'Malicious User',
            email: 'malicious@example.com',
            password: 'password123',
            role: 'ADMIN',
          })
          .expect(401);
      });
    });
  });
});
