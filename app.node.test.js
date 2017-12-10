const request = require('supertest');
const app = require('./app.node.js');

// Testing di Marcello

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

// Testing di Francesco

describe('Testo il get dei ritardi della fermata con il tempo che non è del tipo giusto', () => {
    test("Dovrebbe darmi internal server error 500", (done) => {
        request(app)
        .get("/ritardi/?idFermata=170&rangeTempo=abc")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get dei ritardi della fermata senza parametri', () => {
    test("Dovrebbe darmi errore", (done) => {
        request(app)
        .get("/ritardi/")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get delle fermate senza parametri', () => {
    test("Dovrebbe darmi errore", (done) => {
        request(app)
        .get("/fermate/")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get dei ritardi della fermata con un parmetro in più', () => {
    test("Dovrebbe darmi 200 perchè scarta il parametro aggiuntivo", (done) => {
        request(app)
        .get("/ritardi/?idFermata=170&rangeTempo=\'02:00:00\'&prova=abc")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).not.toBe(0);
          done();
        });
    });
});

describe('Testo il get delle fermate con un parametro in più', () => {
    test("Dovrebbe darmi le fermate attorno a me perchè ignora il parametro aggiuntivo", (done) => {
        request(app)
        .get("/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=\'02:00:00\'&aggiuntivo=42")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).not.toBe(0);
          done();
        });
    });
});

// Testing di Michela

describe('Testo il post dell\'inserimento del workerId al primo accesso', () => {
    test("Dovrebbe darmi errore 500", (done) => {
        request(app)
        .post("/worker/")
        .send({
          workerId: 'dfhgfjfcgjdf',
          userId: '6',
        })
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get delle hits workerId con l\'utente con id 2', () => {
    test("Dovrebbe darmi tutte le hit dell'utente 2", (done) => {
        request(app)
        .get("/hits/?userId=2")
        .then((response) => {
          expect(response.statusCode).not.toBe(500);
          expect(response.body.length).not.toBe(0);
          done();
        });
    });
});

describe('Testo il get del workerId con l\'utente con id 2', () => {
    test("Dovrebbe darmi il workerId dell'utente 2", (done) => {
        request(app)
        .get("/turkid/?userId=2")
        .then((response) => {
          expect(response.statusCode).not.toBe(500);
          expect(response.body.length).not.toBe(0);
          done();
        });
    });
});

describe('Testo il get del workerId con un userId non valido', () => {
    test("Dovrebbe darmi errore 500", (done) => {
        request(app)
        .get("/turkid/?userId=100er0")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get delle fermate con un parametro in più', () => {
    test("Dovrebbe darmi le fermate attorno a me perchè ignora il parametro aggiuntivo", (done) => {
        request(app)
        .post("/hits/visual/")
        .send({
          utentiHitId: '1',
        })
        .then((response) => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
});
