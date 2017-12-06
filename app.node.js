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
//Istanza node-schedule
var schedule= require('node-schedule');
//Istanza bodyparser per leggere i JSON
var bodyParser = require('body-parser');
app.use(bodyParser.json());

//IMPOSTAZIONI AGGIORNAMENTO RITARDI
//Scelgo l'intervallo di aggiornamento automatico dei ritardi.
var intervalloRitardi = 20000; //20000= 20sec
/**
Scelgo il p per la media ponderata che voglio utilizzare per il calcolo dei ritardi
Il p indica il peso che voglio assegnare ad ogni nuova segnalazione:
p alto significa che valuto più importanti i valori che ho già calcolato rispetto
alle nuove segnalazioni, mentre un p basso indica che valuto più importanti le
nuove segnalazioni rispetto a quelle vecchie.
Per evitare valori incredibilmente falsati da alcune segnalazioni fasulle che
potrebbero passare il filtro è opportuno dare meno peso alle nuove segnalazioni,
quindi scegliere un p alto. Un p alto funzionerà meglio con un afflusso elevato
di segnalazioni, quindi nel caso ideale di utilizzo della nostra app.
P ideale: sui 0.8/0.9.
Per il test utilizzo p=0.2 che da più peso alle poche segnalazioni di test
**/
var pMedia=0.2;

<<<<<<< HEAD
<<<<<<< HEAD
//Istanze per Amazon Mechanical Turk
var util = require('util');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./amt-config.json');
fs = require('fs');
//URL della sandbox di AWSMechTurk
var endpoint = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com';
//Connessione alla requester sandbox
var mturk = new AWS.MTurk({ endpoint: endpoint });
//
var schedule = require('node-schedule');

=======
var HITTypeIdUtente;
var HITIdUtente;
>>>>>>> modifica aggiunta worker id degli utenti
=======
>>>>>>> modifica creazione e approvazione HITs

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
app.use(express.static(__dirname + '/docs', opzioni));

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
app.post('/login/', function (request, response, next) {
    //Async waterfall mi permette di avviare delle funzioni in sequenza passando
    //i parametri man mano. Ottima per eseguire queste query ed essere sicuro di
    //chiudere le connsessioni ogni volta
    var primoLogin = false;
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
                primoLogin=true;
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
            'id' : parser[0].id,
            'primoLogin' : primoLogin
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
});

//funzione che aggiunge il WorkerId al database se è la prima volta che l'utente effettua il login
app.post('/worker/', function (request, response, next) {

  async.waterfall([
    function(callback){
      var query = 'update Utente set WorkerId=\'' + request.body.WorkerId + '\' where UserID=\'' + request.body.idUtente + '\';'
      callback(null,query);
    },
    insertQuery,
    function(callback) {
      /**
      QualificationType personalizzata per l'utente per accettare le HIT, la qualification permette di restringere chi
      può accettareuna HIT in modo che un utente può accettare solo le HITs create per lui e non le HITs create per altri utenti
      **/
      var myQualType = {
        Name: 'Qualifica di ',
        Description: 'Qualifica per accettare le HIT personalizzate di ',
        QualificationTypeStatus: 'Active',
      };

      //creazione della QualificationType dell'utente
      mturk.createQualificationType(myQualType, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          var qualTypeId = data.QualificationType.QualificationTypeId;

          callback(null, qualTypeId);
        }
      });
    },
    function(qualTypeId, callback){
      //associazione tra utente e QualificationType
      var myAssociationQualWork = {
        QualificationTypeId: qualTypeId,
        WorkerId: request.body.UserId,
        SendNotification: true,
      };
      //assegna la QualificationType dell'utente all'utente
      mturk.associateQualificationWithWorker(myAssociationQualWork, function (err, data) {
        if (err) {
          console.log(err.message);
        } else {
          console.log(data);
        }
      });
      var query = 'update Utente set QualificationTypeId=\'' + qualTypeId + '\' where UserID=\'' + request.body.idUtente + '\';'
      callback(null,query);
    },
    insertQuery
  ], function(errore) {
    if (errore) {
      console.log(errore);
    } else {
      console.log('ok');
    }
  });
});

/**
 funzione che ritorna le fermate più vicine partendo dalla latitudine e longitudine
 attuale dell'utente + un range che decide lui entro il quale cercare le fermate.
 Tutti i calcoli vengono effettuati su range in linea d'area e vengono eseguiti
 direttamente da MySQL.
 Il JSON uscente avrà i seguenti parametri: idFermata, nomeFermata, latitudine e
 longitudine della fermata.
 **/
app.get('/fermate/', function (request, response, next) {
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
app.get('/ritardi/', function (request, response, next) {
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
app.post('/salita/', function (request, response, next) {
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

        /**
        //Chiamare una query per calcolare la distanza è stupido,
        //considerando che si può direttamente fare in node.

        //creo la Query
        var query="CALL ritardoautobus.Distanza (\'"+
        latUtente+"\',\'"+lonUtente+"\',\'"+
        latFermata+"\',\'"+lonFermata+"\');";
        console.log(query);
        callback(null,query);
      },
      selectQuery,
      function(parser,callback){
        **/

        //CALCOLO LA DISTANZA TRA I DUE PUNTI
        //funzione strana, ma funziona #vivaifisici

        var latUtenteRadianti= latUtente*Math.PI/180;
        var lonUtenteRadianti= lonUtente*Math.PI/180;
        var latFermataRadianti= latFermata*Math.PI/180;
        var lonFermataRadianti= lonFermata*Math.PI/180;
        var distanza = 6366 * Math.acos(
          Math.cos(latUtenteRadianti) * Math.cos(latFermataRadianti) *
          Math.cos(lonFermataRadianti - lonUtenteRadianti) +
          Math.sin(latUtenteRadianti) * Math.sin(latFermataRadianti)
        );

        //FUNZIONA!!!!!
        //console.log(distanza);

        var query=null;
        //console.log(parser[0][0].distance);
        if(distanza<=0.1){
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
          //se il parser non è null la segnalazione è valida e devo cambiare il ritardo
          if(parser.length!==0){
            //la segnalazione è valida, quindi aggiorno il ritardo
            //console.log("ritardo: "+parser[0].Ritardo);
            ritardo=parser[0].Ritardo;
          }else{
            /**
            Qui dentro ci entro SOLO se: la segnalazione è valida
            (mi trovo entro 100m da una fermata) MA non esiste una corsa che
            passa di qui. In genere questo errore non si raggiunge, ma è utile
            loggarlo per vedere se qualcuno si diverte a mandare segnalazioni
            compilate a mano.
            -----------------
            Non ho trovato la corsa e quindi il ritardo.
            Qualcosa non va con il database e/o con la richiesta dell'utente.
            **/
            //Loggo l'errore e chiamo callback con lo stesso.
            var errore = new Error("Non ho trovato il ritardo con questi parametri:"+
              "\n\tidUtente: "+ idUtente+
              "\n\tidFermata: "+ idFermata+
              "\n\tdataOra: "+ dataOra+
              "\n\tidLinea: "+ idLinea+
              "\n\tlatUtente: "+ latUtente+
              "\n\tlonUtente: "+ lonUtente+
              "\n\tsegnalazioneValida: "+ segnalazioneValida);
            callback(errore,null);
            //fermo la funzione, altrimenti prova lo stesso ad inserire
            return errore;
          }
        }
        //inserisco la segnalazione, che sia valida o meno.
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
        callback(null,query);
      },
      insertQuery,
    ], function (errore) {
        if (!errore) {
            console.log('Segnalazione eseguita con successo.');
            response.status(200).send("Segnalazione aggiunta");
        } else {
            console.log('Errore nella waterfall.');
            console.log(errore);
            response.status(500).send("Internal server error.");
        }
    });
});

/**
Funzione che viene avviata ogni giorno alle 3 del mattino.
Aggiorna la tabella dei ritardi inserendo 0 come ritardo ad ogni corsa.
Necessaria per poi poter usufruire di UPDATE nel calcolo del ritardo medio.
**/
var scheduleRitardi = schedule.scheduleJob({hour: 00, minute: 00},function(){
  var query="Insert Into Ritardo (IdCorsa,DataRitardo,Ritardo) "+
              "Select IdCorsa,curdate(),'00:00:00' From Corsa;";
  insertQuery(query,function(errore){
    if(!errore){
      console.log("Azzeramento dei ritardi per la giornata eseguito con successo.");
    }else{
      console.log("Errore nell'azzeramento dei ritardi per la giornata: ");
      console.log(errore);
    }
  })
});
/**
Funzione che viene chiamata ogni intervalloRitardi millisecondi per aggiornare
la tabella dei ritardi a partire dalla tabella delle segnalazioni.
**/
setInterval(function() {
  //questa variabile sarà la mia struttura dati
  //guardare sotto per dettagli.
  var corse = {};
  async.waterfall([
      function(callback){
        //Creo la query da lanciare
        //Cerco inanzitutto gli id delle corse che dovrò aggiornare.
        //Mi salvo anche il ritardo attuale in secondi.
        var query="Select distinct Ritardo.IdCorsa,time_to_sec(Ritardo) as Ritardo From Ritardo, "+
                  "(Select IdCorsa "+
                  "From "+
                  "(Select * "+
                  "From Segnalazione "+
                  "Where Elaborato=0 and SegnalazioneValida=1) As S1, "+
                  "(Select IdCorsa,IdLinea,IdFermata "+
                  "From Corsa_Fermata_Orario) As Id "+
                  "Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata) As T1 "+
                  "Where Ritardo.IdCorsa=T1.IdCorsa;";
        //console.log(query);
        callback(null,query);
      },selectQuery,
      function(parser,callback){
        /**
        creo una struttura dati corse che fungerà da dizionario.
        corse.IdCorsa accederà al ritardo della stessa.
        In questo modo potrò aggiornare la media direttamente da node e
        eseguirò solo un update per corsa.
        **/
        corse={};//reinizializzo il dizionario.
        for(i = 0;i<parser.length;i++){
          //per ogni corsa da aggiornare la inserisco nel dizionario sotto forma di int
          corse[parser[i].IdCorsa]=parser[i].Ritardo;
        }
        //console.log(corse);
        //ora che ho le corse mi servono i ritardi in modo da aggiornare le stesse
        var query="Select Dataora, time_to_sec(S1.Ritardo) as Ritardo, IdCorsa, IdSegnalazione "+
                    "From "+
                    "(Select * "+
                    "From Segnalazione "+
                    "Where Elaborato=0 and SegnalazioneValida=1 and Date(curdate())=Date(DataOra)) As S1, "+
                    "(Select IdCorsa,IdLinea,IdFermata "+
                    "From Corsa_Fermata_Orario) As Id "+
                    "Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata "+
                    "Order by DataOra;";
        //console.log(query);
        callback(null,query);
      },selectQuery,
      function(parser,callback){
        var query=null;
        //aggiorno la query solo se devo
        if(parser.length!=0){
          query= new Array(Object.keys(corse)+1);
          query[0]="update Segnalazione set Elaborato=1 where";
          var indTemp=0;
          for(i=0;i<parser.length;i++){
            //per oggni segnalazione aggiorno il ritardo medio;
            //console.log("Vecchio ritardo: "+corse[parser[i].IdCorsa]);
            //console.log("Segnalazione : "+parser[i].Ritardo);
            corse[parser[i].IdCorsa]=
              pMedia*corse[parser[i].IdCorsa]+
              (1-pMedia)*parser[i].Ritardo;
            //devo aggiornare i record settando le segnalazioni come elaborate  +
            if(indTemp!==0){
              query[0]=query[0]+" OR";
            }
            query[0]=query[0]+" IdSegnalazione = "+parser[i].IdSegnalazione;
            indTemp++;
            //console.log("Nuovo ritardo: "+corse[parser[i].IdCorsa]);
          }
          query[0]=query[0]+";";
          //console.log(query);
          //console.log("Ritardi da inserire:");
          //console.log(corse);
          var chiavi=Object.keys(corse);//accedo alle chiavi di corse.
          //le chiavi di corse sono gli idCorsa.
          for(i=0;i<chiavi.length;i++){
            //aggiungo alla query la query di update del ritardo.
            query[i+1]="update Ritardo set Ritardo=sec_to_time("+corse[chiavi[i]]+
                        ") where DataRitardo=curdate() AND IdCorsa="+chiavi[i]+";";
          }
          //console.log(query);
        }
        //console.log("Query update: "+query);
        callback(null,query);
      },function(query,callback){
        var err=null;
        if(query!==null){
          for(i=0;i<query.length&err===null;i++){
            //eseguo le query finchè ne ho o finchè una di essee non ritorna errore
            //console.log(query[i]);
            connection.query(query[i],function(errore){
              if(errore){
                err=errore;
              }
            });
          }
        }
        callback(err);
      }
  ],function(errore){
    if(!errore){
      console.log("Aggiornamento ritardi eseguito con successo.");
    }else{
      console.log("Errore nell'aggiornamento dei ritardi:");
      console.log(errore);
    }
  });
},intervalloRitardi);

//Easter egg
app.get("/some",function(request,response){
  var shrek="<body style=\"background-image: url(\'"+
  "https://vignette.wikia.nocookie.net/trollpasta/images/5/5c/"+
  "The_hansom_shrek.jpg/revision/latest?cb=20140418120336\');"+
  "background-size:100% 100%;\">"+
  "<h1 style=\"color: #ff3399;\">body once told me the world is gonna roll me "+
  "I ain't the sharpest tool in the shed "+
  "She was looking kind of dumb with her finger and her thumb "+
  "In the shape of an \"L\" on her forehead "+
  "Well the years start coming and they don't stop coming "+
  "Fed to the rules and I hit the ground running "+
  "Didn't make sense not to live for fun "+
  "Your brain gets smart but your head gets dumb "+
  "So much to do, so much to see "+
  "So what's wrong with taking the back streets? "+
  "You'll never know if you don't go "+
  "You'll never shine if you don't glow "+
  "Hey now, you're an all-star, get your game on, go play "+
  "Hey now, you're a rock star, get the show on, get paid "+
  "And all that glitters is gold "+
  "Only shooting stars break the mold "+
  "It's a cool place and they say it gets colder "+
  "You're bundled up now, wait till you get older "+
  "But the meteor men beg to differ "+
  "Judging by the hole in the satellite picture "+
  "The ice we skate is getting pretty thin "+
  "The water's getting warm so you might as well swim "+
  "My world's on fire, how about yours? "+
  "That's the way I like it and I never get bored "+
  "Hey now, you're an all-star, get your game on, go play "+
  "Hey now, you're a rock star, get the show on, get paid "+
  "All that glitters is gold "+
  "Only shooting stars break the mold "+
  "Hey now, you're an all-star, get your game on, go play "+
  "Hey now, you're a rock star, get the show, on get paid "+
  "And all that glitters is gold "+
  "Only shooting stars "+
  "Somebody once asked could I spare some change for gas? "+
  "I need to get myself away from this place "+
  "I said yep what a concept "+
  "I could use a little fuel myself "+
  "And we could all use a little change "+
  "Well, the years start coming and they don't stop coming "+
  "Fed to the rules and I hit the ground running "+
  "Didn't make sense not to live for fun "+
  "Your brain gets smart but your head gets dumb "+
  "So much to do, so much to see "+
  "So what's wrong with taking the back streets? "+
  "You'll never know if you don't go (go!) "+
  "You'll never shine if you don't glow "+
  "Hey now, you're an all-star, get your game on, go play "+
  "Hey now, you're a rock star, get the show on, get paid "+
  "And all that glitters is gold "+
  "Only shooting stars break the mold "+
  "And all that glitters is gold "+
  "Only shooting stars break the mold</h1></body>";
  response.status(200).send(shrek);
});

/*****************************
INIZIO AMAZON MECHANICAL TURK
*****************************/

//legge la domanda da fare all'utente dal file amt-question.xml e crea l'HIT il primo di ogni mese
var j = schedule.scheduleJob('0 0 1 * *', function() {
  fs.readFile('amt-question.xml', 'utf8', function(err, amt-question) {
    if (err) {
      console.log(err);
    } else {
      var query = "Select Count(*) As NumeroSegnalazioni, IdSegnalatore, QualificationTypeId, Nome, Cognome, WorkerId" +
      "From Segnalazione,Utente" +
      "Where IdSegnalatore=UserID and Month(Date(DataOra))=Month(subdate(current_date, 1)) and Year(Date(DataOra))=Year(subdate(current_date, 1))" +
      "Group by IdSegnalatore;";

      selectQuery(query, function(errore, utenti) {
        if (errore) {
          console.log(errore);
        } else {
          for (var i = 0; i < utenti.length; i++) {
            //utenti[i]
            var HITTypeIdUtente;
            var HITIdUtente;
            var reward = '0.10' * utenti[i].NumeroSegnalazioni;

            //costruzione dell'HIT per l'utente
            var HITUtente = {
              Title: 'Conferma segnalazioni di ' + utenti[i].Nome + ' ' + utenti[i].Cognome,
              Description: 'HIT per la conferma delle segnalazioni di ritardo degli autobus di ' + utenti[i].Nome + ' ' + utenti[i].Cognome,
              MaxAssignments: 1,
              LifetimeInSeconds: 604800, // l'utente ha una settimana di tempo per accettare l'HIT e ricevere il pagamento
              AssignmentDurationInSeconds: 240, // da decidere quanto tempo l'utente ha a disposizione per cliccare Conferma
              Reward:  reward.toString(),
              Question: amt-question,
              /* l'HIT può essere accettato solo da chi possiede la giusta qualifica. Ogni utente ha una sua qualifica personalizzata
              ** in modo che ogni utente possa accettare solamente le HITs create per le proprie segnalazioni e non possa accettare le
              ** HITs create per altri utenti*/
              QualificationRequirements: [
                {
                  QualificationTypeId: utenti[i].QualificationTypeId,
                  Comparator: 'Exists',
                },
              ],
            };

            // creazione dell'HIT personalizzato per utente sul sito di AMT
            mturk.createHIT(HITUtente, function (err, data) {
              if (err) {
                console.log(err);
              } else {
                HITTypeIdUtente = data.HIT.HITTypeId;
                HITIdUtente = data.HIT.HITId;

                console.log(data);
                console.log('HIT has been successfully published here: https://workersandbox.mturk.com/mturk/preview?groupId=' + data.HIT.HITTypeId + ' with this HITId: ' + data.HIT.HITId);
              }
            });

            // dopo la creazione della HIT per il pagamento, viene inviata una mail di notifica all'utente per permettergli di confermare il pagamento
            mturk.NotifyWorkers({
              Subject: 'Creazione HIT per pagamento segnalazioni di ' + utenti[i].Nome + ' ' + utenti[i].Cognome,
              MessageText: 'Grazie per le tue segnalazioni! Al seguente link potrai accettare per l\'invio del pagamento: ' +
              'https://workersandbox.mturk.com/mturk/preview?groupId=' + myHITTypeId,
              WorkerIds: [
                utenti[i].WorkerId,
              ]
            }, function(err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log(data);
              }
            });
          }
        }
      });
    }
  });
});

var y = schedule.scheduleJob('0 0 8 * *', function(){

  mturk.listAssignmentsForHIT({HITId: myHITId}, function (err, assignmentsForHIT) {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Completed Assignments found: ' + assignmentsForHIT.NumResults);
      for (var i = 0; i < assignmentsForHIT.NumResults; i++) {
        console.log('Risposta del Worker con ID - ' + assignmentsForHIT.Assignments[i].WorkerId + ': ', assignmentsForHIT.Assignments[i].Answer);

        if (assignmentsForHIT.Assignments[i].WorkerId == 'WorkerId') { // modificare con WorkerId dell'utente
          //approva l'assignment fatto dall'utente per inviare il pagamento
          mturk.approveAssignment({
            AssignmentId: assignmentsForHIT.Assignments[i].AssignmentId,
            RequesterFeedback: 'Grazie per le segnalazioni!',
          }, function (err) {
            console.log(err, err.stack);
          });
        }
      }
    }
  });

});

/***************************
FINE AMAZON MECHANICAL TURK
***************************/


/*****************************
INIZIO AMAZON MECHANICAL TURK
*****************************/

//legge la domanda da fare all'utente dal file amt-question.xml e crea l'HIT il primo di ogni mese
var j = schedule.scheduleJob('0 0 1 * *', function() {
//var j = schedule.scheduleJob('*/1 * * * *', function() { // per test
  fs.readFile('amt-question.xml', 'utf8', function(err, amtQuestion) {
    if (err) {
      console.log(err);
    } else {
      var query = 'Select Count(*) As NumeroSegnalazioni, IdSegnalatore, QualificationTypeId, Nome, Cognome, WorkerId ' +
      'From Segnalazione,Utente ' +
      'Where IdSegnalatore=UserID and Month(Date(DataOra))=Month(subdate(current_date, 1)) and Year(Date(DataOra))=Year(subdate(current_date, 1)) ' +
      'Group by IdSegnalatore;';

      selectQuery(query, function(errore, utenti) {
        if (errore) {
          console.log(errore);
        } else {
          for (var i = 0; i < utenti.length; i++) {
            //utenti[i]
            //var HITTypeIdUtente;
            //var HITIdUtente;
            var reward = '0.10' * utenti[i].NumeroSegnalazioni;

            //costruzione dell'HIT per l'utente
            var HITUtente = {
              Title: 'Conferma segnalazioni di ' + utenti[i].Nome + ' ' + utenti[i].Cognome,
              Description: 'HIT per la conferma delle segnalazioni di ritardo degli autobus di ' + utenti[i].Nome + ' ' + utenti[i].Cognome,
              MaxAssignments: 1,
              LifetimeInSeconds: 604800, // l'utente ha una settimana di tempo per accettare l'HIT e ricevere il pagamento
              AssignmentDurationInSeconds: 240, // da decidere quanto tempo l'utente ha a disposizione per cliccare Conferma
              Reward:  reward.toString(),
              Question: amtQuestion,
              /* l'HIT può essere accettato solo da chi possiede la giusta qualifica. Ogni utente ha una sua qualifica personalizzata
              ** in modo che ogni utente possa accettare solamente le HITs create per le proprie segnalazioni e non possa accettare le
              ** HITs create per altri utenti*/
              QualificationRequirements: [
                {
                  QualificationTypeId: utenti[i].QualificationTypeId,
                  //QualificationTypeId: '3B9KD9M9B16CMSB6N1A06UW4QBNJNJ',
                  Comparator: 'Exists',
                },
              ],
            };

            var idUtente = utenti[i].IdSegnalatore;
            createHITs(idUtente, HITUtente);

            // dopo la creazione della HIT per il pagamento, viene inviata una mail di notifica all'utente per permettergli di confermare il pagamento
            /*mturk.NotifyWorkers({
              Subject: 'Creazione HIT per pagamento segnalazioni di ' + utenti[i].Nome + ' ' + utenti[i].Cognome,
              MessageText: 'Grazie per le tue segnalazioni! Al seguente link potrai accettare per l\'invio del pagamento: ' +
              'https://workersandbox.mturk.com/mturk/preview?groupId=' + myHITTypeId,
              WorkerIds: [
                utenti[i].WorkerId,
              ]
            }, function(err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log(data);
              }
            });*/
          }
        }
      });
    }
  });
});

//var y = schedule.scheduleJob('0 0 7 * *', function(){
var y = schedule.scheduleJob('*/1 * * * *', function(){ // per test

  /*var query = 'select UtentiHitId,Utente.UserID,WorkerId ' +
  'from Utente,Utenti_Hit_Id ' +
  'where Utente.UserID=Utenti_Hit_Id.UserID and DataHit=subdate(current_date, 7);';*/

  // query di test
  var query = 'select UtentiHitId,Utente.UserID,WorkerId ' +
  'from Utente,Utenti_Hit_Id ' +
  'where Utente.UserID=Utenti_Hit_Id.UserID;';

  selectQuery(query, function(errore, parser) {
    if (errore) {
      console.log(errore);
    } else {
      for (var i = 0; i < parser.length; i++) {
        var HITUtente = parser[i].UtentiHitId;
        var WorkerId = parser[i].WorkerId;
        getApproveHITs(HITUtente, WorkerId);

      }
    }
  });
});


var createHITs = function(idUtente, HITUtente) {
  async.waterfall([
    function(callback) {
      // creazione dell'HIT personalizzato per utente sul sito di AMT
      mturk.createHIT(HITUtente, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var HITTypeIdUtente = data.HIT.HITTypeId;
          var HITIdUtente = data.HIT.HITId;

          console.log(data);
          console.log('HIT has been successfully published here: https://workersandbox.mturk.com/mturk/preview?groupId=' + HITTypeIdUtente + ' with this HITId: ' + HITIdUtente);

          var query = 'insert into Utenti_Hit_Id(UserID,UtentiHitId,DataHit) values (' + idUtente + ',\'' + HITIdUtente + '\',curdate());';
          callback(null, query);
        }
      });
    },
    insertQuery,
  ], function(errore) {
    if (errore) {
      console.log(errore);
    } else {
      console.log('Tutto ok');
    }
  });
};

var getApproveHITs = function(HITUtente, WorkerId) {
  mturk.listAssignmentsForHIT({HITId: HITUtente}, function (err, assignmentsForHIT) {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Completed Assignments found: ' + assignmentsForHIT.NumResults);
      for (var i = 0; i < assignmentsForHIT.NumResults; i++) {
        var workId = assignmentsForHIT.Assignments[i].WorkerId;
        if (WorkerId == workId) {
          console.log('Risposta del Worker con ID - ' + workId + ': ', assignmentsForHIT.Assignments[i].Answer);

          //approva l'assignment fatto dall'utente per inviare il pagamento
          mturk.approveAssignment({
            AssignmentId: assignmentsForHIT.Assignments[i].AssignmentId,
            RequesterFeedback: 'Grazie per le segnalazioni!',
          }, function (err) {
            console.log(err);
          });
        } else {
          console.log('WorkerIds non corrispondono: ' + workId + ' e ' + WorkerId);
        }

      }
    }
  });
};

/***************************
FINE AMAZON MECHANICAL TURK
***************************/


//comportamento di default (404)
app.use(function (request, response) {
    response.status(404).send('<h1> Pagina non trovata </h1>');
});
//apro server su porta 7777
app.listen(8080, function () {
    console.log('Server aperto: http://localhost:8080');
});
