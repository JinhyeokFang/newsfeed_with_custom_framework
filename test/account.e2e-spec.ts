import 'reflect-metadata';
import { AccountController } from '../src/account/interface/account.controller';
import request from 'supertest';
import { Server } from '../src/common/server';
import { Connection } from '../src/common/database';
import { json, urlencoded } from 'express';

describe('AccountController (e2e)', () => {
  let app: Express.Application;

  beforeEach(() => {
    const server = new Server([json(), urlencoded({ extended: true })]);
    server.injectController([AccountController]);
    app = server.app;
  });

  afterAll(() => {
    Connection.end();
  });

  describe('/register', () => {
    it('when 정상적으로 요청 should 성공', () => {
      return request(app)
        .post('/account/register')
        .send({
          email: 'abc@abc.com',
          password: '!!',
        })
        .expect({
          email: 'abc@abc.com',
          password: '!!',
        });
    });

    it('when 잘못된 이메일로 요청 should 실패', () => {
      return request(app)
        .post('/account/register')
        .send({
          email: 'not email',
          password: '!!',
        })
        .expect(400);
    });
  });

  it('/login', async () => {
    await request(app).post('/account/register').send({
      email: 'abc@abc.com',
      password: '!!',
    });
    await request(app)
      .post('/account/login')
      .send({
        email: 'abc@abc.com',
        password: '!!!',
      })
      .expect(404);
    return request(app)
      .post('/account/login')
      .send({
        email: 'abc@abc.com',
        password: '!!',
      })
      .expect(200);
  });
});
