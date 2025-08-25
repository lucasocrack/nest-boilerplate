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
  let accessToken: string;

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
  });

  beforeEach(async () => {
    // Create regular user to be used in tests
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
    // Clean up only the test user, keep admin user
    await prisma.user.deleteMany({
      where: {
        userId: {
          not: adminUser.userId,
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up all users
    await prisma.user.deleteMany({});
    await app.close();
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
});
