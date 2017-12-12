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

describe('Testo il post della visualizzazione della hit con id 1', () => {
    test("Dovrebbe aggiornare a visualizzata la hit inviata com e parametro", (done) => {
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

// test di Simone

/**
 * Test sull'utilizzo del CORS e dell'header Access-Control-Allow-Origin
 * nell'interfaccia /fermate
 */
describe('Test utilizzo dell\'header Access-Control-Allow-Origin per il CORS in /fermate', () => {
    test('Controllo ci sia l\'header Access-Control-Allow-Origin e sia uguale a *', (done) => {
        request(app)
        .get('/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=1')
        .expect('Access-Control-Allow-Origin',"*")
        .expect(200,done);
    });
});

/**
 * Test sull'utilizzo del CORS e dell'header Access-Control-Allow-Methods
 * nell'interfaccia /fermate
 */
describe('Test utilizzo dell\'header Access-Control-Allow-Methods per il CORS in /fermate', () => {
    test('Controllo ci sia l\'header Access-Control-Allow-Methods e sia uguale a POST, GET, PUT, DELETE, OPTIONS', (done) => {
        request(app)
        .get('/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=1')
        .expect('Access-Control-Allow-Methods',"POST, GET, PUT, DELETE, OPTIONS")
        .expect(200,done);
    });
});

/**
 * Test sull'utilizzo del CORS e del metodo options nell'interfaccia /fermate
 */
describe('Test utilizzo metodo OPTIONS in /fermate', () => {
    test('Controllo che risposta sia con lo status 200', (done) => {
        request(app)
        .options('/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=1')
        .expect(200,done);
    });
});


/**
 * Test sull'utilizzo dell'header Content-Type nell'interfaccia /fermate
 */
describe('Test utilizzo dell\'hearder Content-Type in /fermate', () => {
    test('Controllo che l\'header Content-Type sia application/json', (done) => {
        request(app)
        .get('/fermate/?latitude=46.0659276&longitude=11.1548419&scanRange=1')
        .expect('Content-Type',"application/json; charset=utf-8")
        .expect(200,done);
    });
});
/**
 * Test post di un login
 */
describe('Testo il post generato dal login di un utente', () => {
    test("Dovrebbe rispondermi con il body", (done) => {
        request(app)
        .post("/login")
        .send({
            "email":"thefallen5555@gmail.com",
            "nome":"the",
            "cognome":"fallen",
            "linkFoto":"https://lh5.googleusercontent.com/-wYgBwcjY8ik/AAAAAAAAAAI/AAAAAAAAAAA/AFiYof3QYaaThh6lNRAJa9VnBbjqTgfJHw/s96-c/photo.jpg"}
        )
        .then((response) => {
            expect(response.body.length).not.toBe(0);
            done();
        });
    });
});


//TEST DI MICHELE

describe('Testo il post della salita senza i parametri', () => {
    test("Dovrebbe darmi errore", (done) => {
        request(app)
        .post("/salita/")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il get delle fermate senza passare la longitudine', () => {
    test("Dovrebbe darmi errore", (done) => {
        request(app)
        .get("/fermate/?latitude=46.0659276&&scanRange=\'02:00:00\'")
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il post della salita con parametri non completi', () => {
    test("Dovrebbe darmi errore", (done) => {
        request(app)
        .post("/salita/")
        .send({
          idUtente: '7',
          dataora: '2017-12-11 15:20:00',
          idLinea: '5',
          idCorsa: '185',
          idFermata: '170',
          latUtente: '46.07543'
        })
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        });
    });
});

describe('Testo il post del login di un utente dove non passo i parametri', () => {
    test("Dovrebbe darmi 400 bad request", (done) => {
        request(app)
        .post("/login/")
        .then((response) => {
            expect(response.statusCode).toBe(400);
            done();
        });
    });
});

describe('Testo il get dei ritardi della fermata di una fermata che non esiste', () => {
    test("Dovrebbe funzionare lo stesso", (done) => {
        request(app)
        .get("/ritardi/?idFermata=10000&rangeTempo=\'02:00:00\'")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
});

//Tests di Anna

//CORS: access control allow content type
describe('Test utilizzo dell\'header Content-Type in /ritardi', () => {
    test('Deve esserci l\'header Content-Type in formato application/json', (done) => {
        request(app)
        .get("/ritardi/?idFermata=170&rangeTempo=\'02:00:00\'")
        .expect('Content-Type',"application/json; charset=utf-8")
        .expect(200,done);
    });
});

//CORS: acces controlo allow origin
describe('Test utilizzo dell\'header Access-Control-Allow-Origin in /fermate', () => {
    test('Deve esserci l\'header Access-Control-Allow-Origin uguale a *', (done) => {
        request(app)
        .get("/ritardi/?idFermata=170&rangeTempo=\'02:00:00\'")
        .expect('Access-Control-Allow-Origin',"*")
        .expect(200,done);
    });
});

//CORS: access control allow options
describe('Test utilizzo metodo OPTIONS in /ritardi', () => {
    test('Deve esserci lo status code uguale a 200', (done) => {
        request(app)
        .options("/ritardi/?idFermata=170&rangeTempo=\'02:00:00\'")
        .expect(200,done);
    });
});

//CORS: access control allow methods
describe('Test utilizzo dell\'header Access-Control-Allow-Methods per il CORS in /fermate', () => {
    test('Devi esserci l\'header Access-Control-Allow-Methods uguale a POST, GET, PUT, DELETE, OPTIONS', (done) => {
        request(app)
        .get("/ritardi/?idFermata=170&rangeTempo=\'02:00:00\'")
        .expect('Access-Control-Allow-Methods',"POST, GET, PUT, DELETE, OPTIONS")
        .expect(200,done);
    });
});

describe('Test post della segnalazione di una salita corretta da Povo Piazza Manci sul 5', () => {
    test("Dovrebbe darmi codice 200", (done) => {
        request(app)
        .post("/salita/")
        .send({
          idUtente: '1',
          dataora: '2017-12-10 19:10:00',
          idLinea: '2',
          idCorsa: '196',
          idFermata: '170',
          latUtente: '46.06580734',
          lonUtente: '11.15461731',
          latFermata: '46.06580734',
          lonFermata: '11.15461731'
        })
        .then((response) => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
});
