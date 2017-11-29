//connessione SQL
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'ritardoautobus.c147tajn45vc.us-east-2.rds.amazonaws.com',
    user: 'ritardoautobus',
    password: 'trentino',
    database: 'ritardoautobus'
});

//istanza async per waterfall
var async = require('async');
//Istanza Express
var express = require('express');
var app = express();
//Istanza bodyparser per leggere i JSON
var bodyParser = require('body-parser');
app.use(bodyParser.json());

/****************
 INIZIO WEBSERVER
 ****************/
var opzioni = {
    dotfiles: 'ignore', //ignora i files preceduti dal punto
    etag: false,
    fallthrough: true, //se non trova il file salta la funzione e va a quella dopo
    index: 'index.html', //default index
    maxAge: '1d', //quanto rimane in cache
    redirect: false,
    setHeaders: function (res, path, stat) { //imposta il documento
        res.set('x-timestamp', Date.now())
    }
}
//invece che cercare nella root del programma redirigo le pagine statice in Front-End
//Front-End è un brutto nome per una cartella, la cambierei in webdocs o
//qualcosa di simile.
app.use(express.static(__dirname + '/Front-End', opzioni));

/*****************
 FINE WEBSERVER
 ******************/

/*****************
 INIZIO QUERYS
 *****************/

//funzione per fare una query di inserimento generica
var insertQuery = function (query, callback) {
    //eseguo l'inserimento solo se la query è diversa da null
    if (query != null) {
        connection.query(query, function (errore) {
            if (!errore) {
                callback(null);
                return;
            } else {
                callback(errore);
            }
        });
    } else {
        callback(null);
    }
}

/**
 funzione per fare una query di ricerca generica
 callback è una funzione che viene chiamata una volta che ho finito la Query
 è necessaria per via dell'asincronicità di Node.
 la funzione callback è una funzione con 2 parametri, il primo è errore,
 il secondo sono i dati.
 **/
var selectQuery = function (query, callback) {
    //eseguo la query solo se è diversa da null
    if (query != null) {
        connection.query(query, function (errore, righe, campi) {
            if (!errore) {
                //trasformo l'output in JSON e poi creo il parser
                var parser = JSON.parse(JSON.stringify(righe));
                //chiamo la funzione callback con errore null e il parser
                callback(null, parser);
                return;
            } else {
                //chiamo la funzione callback non l'errore e nessun risultato
                callback(errore, null);
            }
        });
    } else {
        callback(null, null);
    }
}
/************
 FINE QUERYS
 ***********/

//Gestione login
app.post('/postlogin', function (request, response, next) {
    //Async waterfall mi permette di avviare delle funzioni in sequenza passando
    //i parametri man mano. Ottima per eseguire queste query ed essere sicuro di
    //chiudere le connsessioni ogni volta
    async.waterfall([
        function (callback) {
            var query = "SELECT count(*) as conteggio from ritardoautobus.Utente where Email='" +
                    request.body.email + "';";
            //chiamo la prossima funzione nella sequenza
            callback(null, query);
        },
        selectQuery,
        function (parser, callback) {
            if (parser[0].conteggio === 0) {
                //gestione del primo login
                //la prima volta che un utente si connette al servizio devo inserirlo
                //nel nostro database.
                console.log("devo fare l'utente");
                var query = "INSERT INTO ritardoautobus.Utente (Nome,Cognome,Email,LinkFoto) VALUES (\'" +
                        request.body.nome + "\',\'" +
                        request.body.cognome + "\',\'" +
                        request.body.email + "\',\'" +
                        request.body.linkFoto + "\');";
                callback(null, query);
            } else {
                //non devo fare l'Inserimento
                //il primo null è per l'errore, il secondo è per la query vuota
                callback(null, null);
            }
        },
        insertQuery,
        function (callback) {
            /**
            Ora che sono sicuro che l'utente si trova all'interno del database
            richiedo al mio database il suo id da salvare in un cookie per
            semplificare tutte le query successive
            **/
            query = "SELECT UserId as id FROM ritardoautobus.Utente where Email=\'" +
                    request.body.email + "\';";
            callback(null,query);
        },
        selectQuery,
        function(parser,callback){
          //creo il JSON
          var data = {
            'id' : parser[0].id
          }
          response.send(JSON.stringify(data));
        }
    ], function (errore) {
        if (!errore) {
            console.log('appost');
        } else {
            console.log('Errore nella waterfall.');
            console.log(errore);
            response.status(500).send("Internal server error.");
        }
    });
})

/**
 funzione che ritorna le fermate più vicine partendo dalla latitudine e longitudine
 attuale dell'utente + un range che decide lui entro il quale cercare le fermate.
 Tutti i calcoli vengono effettuati su range in linea d'area e vengono eseguiti
 direttamente da MySQL.
 Il JSON uscente avrà i seguenti parametri: idFermata, nomeFermata, latitudine e
 longitudine della fermata.
 **/
app.get('/get-fermate', function (request, response, next) {
    // permetto CORS
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // preparo l'header json
    response.header('Content-Type', 'application/json');
    //stored procedure che trova le fermate più vicine
    var query = "CALL ritardoautobus.Nearest(" +
            request.query.latitude + ", " +
            request.query.longitude + ", " +
            request.query.scanRange + ");";
    selectQuery(query, function (errore, parser) {
        if (!errore) {
            //creo il JSON
            var fermate = {
                fermate: [
                ]
            }
            //per ogni fermata inserisco nel JSON i suoi dati
            for (var i = 0; i < parser[0].length; i++) {
                fermate.fermate.push({
                    "idFermata": parser[0][i].IdFermata,
                    "nomeFermata": parser[0][i].NomeFermata,
                    "latitudine": parser[0][i].Latitudine,
                    "longitudine": parser[0][i].Longitudine
                });
            }
            //ritorno le fermate
            response.send(fermate);
        } else {
            console.log("Errore nella ricerca delle fermate più vicine.");
            console.log(errore);
            response.status(500).send("Errore nel server.");
        }
    });
});

/**
 funzione che ritorna le linee che passano per una fermata con i propri ritardi
 i parametri di questa funzione sono due e passati per get:
 l'id della fermata (idFermata) e il tempo in HH:MM:SS del range che voglio vedere
 (rangeTempo), ad esempio con parametro 00:40:00 vedrò tutti gli autobus che
 passeranno per quella Fermata nei prossimi 40 minuti.
 Di ritorno verrà inviato un JSON con: idLinea, nomeLinea, orario e ritardo.
 **/
app.get('/get-ritardi', function (request, response, next) {
    // permetto CORS
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // preparo l'header json
    response.header('Content-Type', 'application/json');
    //stored procedure che trova le linee e i ritardi per ogni linea
    var query = "CALL ritardoautobus.Linee_Ritardi(" +
            request.query.idFermata + ", " +
            request.query.rangeTempo + ");";
    //console.log("query: "+query);
    selectQuery(query, function (errore, parser) {
        if (!errore) {
            //creo il JSON
            var lineeRitardi = {
                lineeRitardi: [
                ]
            }
            /*
            //per ogni linea inserisco nel JSON i suoi dati
            for (var i = 0; i < parser[0].length; i++) {
                lineeRitardi.lineeRitardi.push({
                    "idLinea": parser[0][i].IdLinea,
                    "nomeLinea": parser[0][i].NomeLinea,
                    "orario": parser[0][i].Orario,
                    "ritardo": parser[0][i].Ritardo,
                    "idCorsa": parser[0][i].IdCorsa,
                    "idFermata" : request.query.idFermata
                });
                lineeRitardi.idFermata = request.query.idFermata;
            }*/


            //dati test
            lineeRitardi.lineeRitardi.push({
                "idLinea": 1,
                "nomeLinea": "5 - DirezioneOltrecastello",
                "orario": "15:00:00",
                "ritardo": "00:05:00",
                "idCorsa": 1,
                "idFermata" : request.query.idFermata
            });
            //console.log(lineeRitardi);


            //ritorno i ritardi
            response.send(lineeRitardi);
        } else {
            console.log("Errore nella ricerca delle linee e ritardi.");
            console.log(errore);
            response.status(500).send("Errore nel server.");
        }
    });
});

/**
 Funzione per la segnalazione dei ritardi.
 In input chiede i seguenti parametri: idUtente, dataora, idLinea, latitudine,Longitudine
 Manca in input idLinea.
 **/
app.post('/postsalita', function (request, response, next) {
    //console.log(JSON.stringify(request.body,null,4));

    //Valori di test
    var idUtente = request.body.idUtente;
    var dataOra = request.body.dataOra;
    var idLinea = request.body.idLinea;
    var idCorsa = request.body.idCorsa;
    var idFermata = request.body.idFermata;
    var latUtente = request.body.latUtente;
    var lonUtente = request.body.lonUtente;
    var latFermata = request.body.latFermata;
    var lonFermata = request.body.lonFermata;
    //assumo che la segnalazione NON sia valida.
    var segnalazioneValida = 0;
    // il valore di default del ritardo è 0.
    // lo calcolo solo se la segnalazione è valida..
    var ritardo = '00:00:00';

    /**
    //Valori di test
    var idUtente = 1; //id utente  del nostro database da prendere dal cookie
    var dataora = request.body.dataOra;
    var idLinea = 1; //id della linea da prendere dal JSON
    var latUtente = 46.06580240; //latitudine da prendere dal JSON
    var lonUtente = 11.15461478; //longitudine da prendere dal JSON
    **/

    //funzioni a cascata
    async.waterfall([
      function(callback){
        //Controllo se la segnalazione è valida.
        //creo la Query
        var query="CALL ritardoautobus.Distanza (\'"+
        latUtente+"\',\'"+lonUtente+"\',\'"+
        latFermata+"\',\'"+lonFermata+"\');";
        console.log(query);
        callback(null,query);
      },
      selectQuery,
      function(parser,callback){
        var query=null;
        //console.log(parser[0][0].distance);
        if(parser[0][0].distance<=0.1){
          //l'utente si trova a meno di 100 metri dalla Fermata
          //accetto la segnalazione.
          segnalazioneValida=1;
          //calcolo il ritardo con la linea e la fermata.
          query="Select Timediff(Time(addtime(now(),'01:00:00')),Orario) As Ritardo "+
                "From Corsa_Fermata_Orario "+
                "Where IdFermata="+idFermata+
                " and IdLinea="+idLinea+
                " and IdCorsa="+idCorsa+";";
          //console.log(query);
        }
        callback(null, query);
      },
      selectQuery,
      function(parser,callback){
          if(parser!==null){
            //la segnalazione è valida, quindi aggiorno il ritardo
            //console.log("ritardo: "+parser[0].Ritardo);
            ritardo=parser[0].Ritardo;
          }
          var query = "INSERT INTO ritardoautobus.Segnalazione " +
                  "(IdSegnalatore,IdFermata,DataOra,Ritardo,Linea,Latitudine,Longitudine,SegnalazioneValida) VALUES (" +
                  idUtente  + "," +
                  idFermata + ",\'" +
                  dataOra   + "\',\'" +
                  ritardo   + "\',"+
                  idLinea   + ","   +
                  latUtente + ","   +
                  lonUtente + ","+
                  segnalazioneValida + ");";
          console.log(query);
          callback(null,query);
      },
      insertQuery,
    ], function (errore) {
        if (!errore) {
            console.log('appost');
            response.status(200).send("Segnalazione aggiunta");
        } else {
            console.log('Errore nella waterfall.');
            console.log(errore);
            response.status(500).send("Internal server error.");
        }
    });
});

//comportamento di default (404)
app.use(function (request, response) {
    /*
     response.signal(404);
     response.write('<h1> Pagina non trovata </h1>');
     response.end();
     */
    //stesso risultato in una riga soltanto
    response.status(404).send('<h1> Pagina non trovata </h1>');
});
//apro server su porta 7777
app.listen(8080, function () {
    console.log('Server aperto: http://localhost:8080');
});
