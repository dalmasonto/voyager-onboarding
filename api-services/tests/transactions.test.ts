import request from "supertest";
import { Express } from 'express';
import app from "../src/app"

let server: Express

describe('Result should have "transactions" & "meta"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 200', (done) => {
    request(server)
      .get('/transactions?ps=10&p=1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('transactions')
        expect(res.body).toHaveProperty('meta')
        done()
      })
  });
});


describe('Result should have "type"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 404', (done) => {
    request(server)
      .get('/transactions/0x6def39a0a17789e01389ee4a96b58232442ea66de4564f8483a06c475f389bf')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('type');
        done()
      })
  }, 20000);
});

