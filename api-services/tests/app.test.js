"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
let server;
describe('APP should say "Hello World!"', () => {
    beforeAll(() => {
        server = app_1.default;
    });
    it('should return 200', (done) => {
        (0, supertest_1.default)(server)
            .get('/')
            .expect(200)
            .end((err, res) => {
            if (err)
                return done(err);
            expect(res.body).toMatchObject({ 'message': `Hello World!` });
            done();
        });
    });
});
