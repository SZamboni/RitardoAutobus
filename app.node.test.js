const request = require('supertest');
const app = require('./app.node.js');

describe('Testo il root', () => {
    test('Dovrebbe darmi 200', (done) => {
        request(app).get('/').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});

describe('Testo una pagina inesistente', () => {
    test('Dovrebbe darmi 404', (done) => {
        request(app).get('/sijdhfsjdhg').then((response) => {
            expect(response.statusCode).toBe(404);
            done();
        });
    });
});

describe('Testo il get delle fermate', () => {
    test("Dovrebbe darmi le fermate attorno a me", (done) => {
        request(app)
        .get("/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=\'02:00:00\'")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).not.toBe(0);
          done();
        });
    });
});

describe('Testo il get delle fermate senza specificare il range temporale', () => {
    test("Dovrebbe darmi 500 internal server error", (done) => {
        request(app)
        .get("/fermate/?latitude=46.0659276&longitude=11.1548419")
        .then((response) => {
            expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get delle fermate con un dato sbagliato (02:00:00 al posto di \'02:00:00\')', () => {
    test("Dovrebbe darmi 500 internal server error", (done) => {
        request(app)
        .get("/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=02:00:00")
        .then((response) => {
            expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get dei ritardi della fermata di povo piazza manci', () => {
    test("Dovrebbe darmi i ritardi della fermata", (done) => {
        request(app)
        .get("/ritardi/?idFermata=170&rangeTempo=\'02:00:00\'")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).not.toBe(0);
          done();
        });
    });
});

describe('Testo il get dei ritardi della fermata senza range temporale', () => {
    test("Dovrebbe darmi internal server error 500", (done) => {
        request(app)
        .get("/ritardi/?idFermata=170'")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});
