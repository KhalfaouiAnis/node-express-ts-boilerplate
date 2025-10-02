import { app, server } from '../src/index';

const request = require('supertest');

describe('GET /', () => {
  afterAll(() => server.close());

  it('should return Hello, Typescript with Express', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toEqual(200);

    expect(res.text).toBe('Hello, Typescript with Express!');
  });
});
