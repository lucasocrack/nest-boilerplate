import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/config/prisma.service';
import { CreateUserDto } from 'src/application/auth/dto/create-auth.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await prisma.user.deleteMany({});
  });

  describe('/auth/register (POST)', () => {
    it('should register AuthRequest.ts new user and return the user object without the password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'e2etestuser',
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
          expect(res.body.username).toEqual(createUserDto.username);
          expect(res.body.password).toBeUndefined();
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login AuthRequest.ts user and return an access token', async () => {
      const createUserDto: CreateUserDto = {
        username: 'e2eloginuser',
        name: 'E2E Login User',
        email: 'e2elogin@example.com',
        password: 'password123',
      };

      // First, register the user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201);

      // Now, login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: createUserDto.username,
          password: createUserDto.password,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.access_token).toBeDefined();
        });
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should send AuthRequest.ts password reset token', async () => {
      const createUserDto: CreateUserDto = {
        username: 'forgotpassworduser',
        name: 'Forgot Password User',
        email: 'forgotpassword@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: createUserDto.email })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.token).toBeDefined();
        });
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should reset the password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'resetpassworduser',
        name: 'Reset Password User',
        email: 'resetpassword@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201);

      const forgotPasswordResponse = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: createUserDto.email })
        .expect(200);

      const resetToken = forgotPasswordResponse.body.token;
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
          username: createUserDto.username,
          password: newPassword,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.access_token).toBeDefined();
        });
    });
  });
});
