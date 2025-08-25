import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { PrismaService } from '../src/core/config/prisma.service';
import { CreateUserDto } from 'src/application/auth/dto/create-auth.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    // Clean up the database after each test
    if (prisma) {
      await prisma.user.deleteMany({});
    }
  });

  describe('/auth/register (POST)', () => {
    it('should register AuthRequest.ts new user and return the user object without the password', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'e2etestuser',
        name: 'E2E Test User',
        email: 'e2e@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(
            (res.body as { data: { userName: any; password: any } }).data
              .userName,
          ).toEqual(createUserDto.userName);
          expect(
            (res.body as { data: { userName: any; password: any } }).data
              .password,
          ).toBeUndefined();
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login AuthRequest.ts user and return an access token', async () => {
      // Create an active user directly in the database
      const hashedPassword =
        '$2b$10$Tg.So1.IHvrbCQ8Pg/3nZOGS0lu7.hWHwVSJGrhaUa1LnjFnvHAhm'; // hash of 'password123'
      await prisma.user.create({
        data: {
          userName: 'e2eloginuser',
          name: 'E2E Login User',
          email: 'e2elogin@example.com',
          password: hashedPassword,
          active: true, // Usuário ativo
        },
      });

      // Now, login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identification: 'e2elogin@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(
        (response.body as { data: { access_token: any } }).data.access_token,
      ).toBeDefined();
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should send AuthRequest.ts password reset token', async () => {
      // Create an active user directly in the database
      const hashedPassword =
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // hash of 'password123'
      await prisma.user.create({
        data: {
          userName: 'forgotpassworduser',
          name: 'Forgot Password User',
          email: 'forgotpassword@example.com',
          password: hashedPassword,
          active: true, // Usuário ativo
        },
      });

      // Now, request password reset
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'forgotpassword@example.com',
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(
            (res.body as { data: { token: any } }).data.token,
          ).toBeDefined();
        });
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should reset the password', async () => {
      // Create an active user directly in the database
      const hashedPassword =
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // hash of 'password123'
      await prisma.user.create({
        data: {
          userName: 'resetpassworduser',
          name: 'Reset Password User',
          email: 'resetpassword@example.com',
          password: hashedPassword,
          active: true, // Usuário ativo
        },
      });

      const forgotPasswordResponse = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'resetpassword@example.com' })
        .expect(200);

      const resetToken = (
        forgotPasswordResponse.body as { data: { token: string } }
      ).data.token;
      const newPassword = 'newpassword456';

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
          passwordConfirmation: newPassword,
        })
        .expect(200);

      // Try to login with the new password
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identification: 'resetpassword@example.com',
          password: newPassword,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(
            (res.body as { data: { access_token: any } }).data.access_token,
          ).toBeDefined();
        });
    });
  });
});
