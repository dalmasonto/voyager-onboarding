import request from "supertest";
import { Express } from 'express';
import app from "../src/app"

let server: Express

describe('APP should say "Server is running!!!"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 200', (done) => {
    request(server)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({ 'message': 'Server is running!!!' })
        done()
      })
  });
});

describe('Result should have "blocks" & "meta"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 200', (done) => {
    request(server)
      .get('/blocks?ps=10&p=1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('blocks')
        expect(res.body).toHaveProperty('meta')
        done()
      })
  });
});


describe('Result should have "block_number"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 404', (done) => {
    request(server)
      .get('/block/79528')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('block_number');
        done()
      })
  }, 20000);
});


describe('Result should have "Timestamp"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 200', (done) => {
    request(server)
      .get('/block_hash/0x4d5176ef10a868b9ed5a2b02bddbf609f10ef79fd11cdaa1842ab1e9e475bc5')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('timestamp');
        done()
      })
  }, 20000);
});
