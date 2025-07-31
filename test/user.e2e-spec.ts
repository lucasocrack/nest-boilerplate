import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/services/prisma.service';
import { CreateUserDto } from 'src/application/dto/create-auth.dto';
import { User, Role } from '../generated/prisma';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Create a user to be used in tests
    user = await prisma.user.create({
      data: {
        username: 'testuser-for-user-e2e',
        name: 'Test User',
        email: 'testuser-e2e@example.com',
        password: 'password123',
      },
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return an array of users', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(1);
          expect(res.body[0].username).toEqual(user.username);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a single user', async () => {
      return request(app.getHttpServer())
        .get(`/users/${user.userId}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.username).toEqual(user.username);
        });
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      const newName = 'Updated Test User';
      return request(app.getHttpServer())
        .patch(`/users/${user.userId}`)
        .send({ name: newName })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.name).toEqual(newName);
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should soft delete a user', async () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.userId}`)
        .expect(200)
        .then(async () => {
          const deletedUser = await prisma.user.findUnique({ where: { userId: user.userId } });
          expect(deletedUser).toBeNull();
        });
    });
  });
});
