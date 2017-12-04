//connessione SQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'ritardoautobus.c147tajn45vc.us-east-2.rds.amazonaws.com',
  user     : 'ritardoautobus',
  password : 'trentino',
  database : 'ritardoautobus'
});

//istanza async per waterfall
var async = require('async');
//Istanza Express
var express = require('express');
var app=express();
//Istanza bodyparser per leggere i JSON
var bodyParser= require('body-parser');
app.use(bodyParser.json());
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
app.use(express.static(__dirname + '/Front-End',opzioni));

/*****************
FINE WEBSERVER
******************/

/*****************
INIZIO QUERYS
*****************/

//funzione per fare una query di inserimento generica
var insertQuery = function(query,callback){
  //eseguo l'inserimento solo se la query è diversa da null
  if(query!=null){
    connection.query(query,function (errore){
      if(!errore){
        callback(null);
        return;
      }else{
        callback(errore);
      }
    });
  }else{
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
var selectQuery = function(query,callback){
  //eseguo la query solo se è diversa da null
  if(query!=null){
    connection.query(query,function (errore,righe, campi){
      if (!errore){
        //trasformo l'output in JSON e poi creo il parser
        var parser= JSON.parse(JSON.stringify(righe));
        //chiamo la funzione callback con errore null e il parser
        callback(null,parser);
        return;
      }else{
        //chiamo la funzione callback non l'errore e nessun risultato
        callback(errore,null);
      }
    });
  }else{
    callback(null,null);
  }
}
/************
FINE QUERYS
***********/

//Gestione login
app.post('/postlogin', function(request,response,next){
    //Async waterfall mi permette di avviare delle funzioni in sequenza passando
    //i parametri man mano. Ottima per eseguire queste query ed essere sicuro di
    //chiudere le connsessioni ogni volta
    async.waterfall([
      function(callback){
        var query = "SELECT count(*) as conteggio from ritardoautobus.Utente where Email='"+
        request.body.email+"';";
        //chiamo la prossima funzione nella sequenza
        callback(null,query);
      },
      selectQuery,
      function(parser,callback){
        if(parser[0].conteggio===0){
            //gestione del primo login
            //la prima volta che un utente si connette al servizio devo inserirlo
            //nel nostro database.
            console.log("devo fare l'utente");
            var query= "INSERT INTO ritardoautobus.Utente (Nome,Cognome,Email,LinkFoto) VALUES (\'"+
            request.body.nome+"\',\'"+
            request.body.cognome+"\',\'"+
            request.body.email+"\',\'"+
            request.body.linkFoto+"\');";
            callback(null,query);
        }else{
          //non devo fare l'Inserimento
          //il primo null è per l'errore, il secondo è per la query vuota
          callback(null,null);
        }
      },
      insertQuery,
      function(callback){
        /**
        Ora che sono sicuro che l'utente si trova all'interno del database
        richiedo al mio database il suo id da salvare in un cookie per
        semplificare tutte le query successive
        **/
        console.log("cerco l'id");
        callback(null);
      }
    ],function (errore){
      if(!errore){
        console.log('appost');
      }else{
        console.log('Errore nella waterfall.');
        console.log(errore);
      }
    });
    query= "SELECT UserId as id FROM ritardoautobus.Utente where Email=\'"+
    request.body.email+"\');";
    // send a response
    response.send("OK");
});

//funzione che aggiunge il WorkerId al database se è la prima volta che l'utente effettua il login
app.post('/worker', function (request, response, next) {
    /**
    QualificationType personalizzata per l'utente per accettare le HIT, la qualification permette di restringere chi
    può accettareuna HIT in modo che un utente può accettare solo le HITs create per lui e non le HITs create per altri utenti
    **/
    var myQualType = {
      //Name: 'Qualification for ' + request.body.nome + ' ' + request.body.cognome,
      //Description: 'Qualifica per accettare le HIT personalizzate di ' + request.body.nome + ' ' + request.body.cognome,
      Name: 'Qualification for ',
      Description: 'Qualifica per accettare le HIT personalizzate di ',
      QualificationTypeStatus: 'Active',
    };
    var qualTypeId;
    //creazione della QualificationType dell'utente
    mturk.createQualificationType(myQualType, function (err, data){
      if (err) {
        console.log(err.message);
      } else {
        console.log(data);
        qualTypeId = data.QualificationType.QualificationTypeId;
      }
    });

    //associazione tra utente e QualificationType
    var myAssociationQualWork = {
      QualificationTypeId: qualTypeId,
      WorkerId: 'WorkerId', //da modificare con il WorkerId inserito dall'utente
      SendNotification: true,
    };
    //assegna la QualificationType dell'utnte all'utente
    mturk.associateQualificationWithWorker(myAssociationQualWork, function (err, data) {
      if (err) {
        console.log(err.message);
      } else {
        console.log(data);
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
app.get('/get-fermate', function (request, response, next) {
    // permetto CORS
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // preparo l'header json
    response.header('Content-Type', 'application/json');
    //stored procedure che trova le fermate più vicine
    var query="CALL ritardoautobus.Nearest("+
                request.query.latitude+", "+
                request.query.longitude+", "+
                request.query.scanRange+");";
    selectQuery(query,function(errore,parser){
      if(!errore){
        //creo il JSON
        var fermate = {
            fermate : [
            ]
        }
        //per ogni fermata inserisco nel JSON i suoi dati
        for(var i=0;i<parser[0].length;i++){
          fermate.fermate.push({
            "idFermata":    parser[0][i].IdFermata,
            "nomeFermata":  parser[0][i].NomeFermata,
            "latitudine":   parser[0][i].Latitudine,
            "longitudine":  parser[0][i].Longitudine
          });
        }
        //ritorno le fermate
        response.send(fermate);
      }
      else{
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
    var query="CALL ritardoautobus.Linee_Ritardi("+
                request.query.idFermata+", "+
                request.query.rangeTempo+");";
    //console.log("query: "+query);
    selectQuery(query,function(errore,parser){
      if(!errore){
        //creo il JSON
        var lineeRitardi = {
            lineeRitardi : [
            ]
        }
        //per ogni linea inserisco nel JSON i suoi dati
        for(var i=0;i<parser[0].length;i++){
          lineeRitardi.lineeRitardi.push({
            "idLinea":    parser[0][i].IdLinea,
            "nomeLinea":  parser[0][i].NomeLinea,
            "orario":     parser[0][i].Orario,
            "ritardo":    parser[0][i].Ritardo
          });
        }
        //ritorno i ritardi
        response.send(lineeRitardi);
      }
      else{
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
app.post('/postsalita',function(request,response,next){
    var idUtente=1; //id utente  del nostro database da prendere dal cookie
    var dataora=request.body.dataOra;
    var idLinea=1; //id della linea da prendere dal JSON
    var latitudine=46.06580240; //latitudine da prendere dal JSON
    var longitudine=11.15461478; //longitudine da prendere dal JSON
    //costruisco la query
    var query = "INSERT INTO ritardoautobus.Segnalazione "+
    "(IdSegnalatore,DataOra,Linea,Latitudine,Longitudine) VALUES ("+
    idUtente + ",\'" +
    dataora + "\'," +
    idLinea + "," +
    latitudine + "," +
    longitudine + ");";
    //lancio la query
    insertQuery(query,function(errore){
      if(errore){
        console.log("Errore nell'inserimento della segnalazione.");
      }
    });
    response.status(200).send("Segnalazione aggiunta");
});


/*****************************
INIZIO AMAZON MECHANICAL TURK
*****************************/

//legge la domanda da fare all'utente dal file amt-question.xml e crea l'HIT il primo di ogni mese
var j = schedule.scheduleJob('0 0 1 * *', function() {



  fs.readFile('amt-question.xml', 'utf8', function (err, myQuestion) {
      var myHITTypeId;
      var myHITId;

      if (err) {
          return console.log(err);
      }

      //costruzione dell'HIT
      var myHIT = {
          Title: 'Conferma segnalazioni di ',
          Description: 'HIT per la conferma delle segnalazioni di ',
          MaxAssignments: 1,
          LifetimeInSeconds: 604800, //l'utente ha una settimana di tempo per accettare l'HIT
          AssignmentDurationInSeconds: 30,
          Reward: '0.20', //da modificare con il reward basato dal conto delle segnalazioni effettuate
          Question: myQuestion,
          //l'HIT è accettabile solo se si possiede la qualificazione giusta
          QualificationRequirements: [
              {
                  QualificationTypeId: '00000000000000000071', // da modificare con QualificationTypeId dell'utente
                  Comparator: 'Exists',
              },
          ],
      };

      //creazione dell'HIT su AMechTurk workersandbox
      mturk.createHIT(myHIT, function (err, data) {
          if (err) {
              console.log(err.message);
          } else {
              myHITTypeId = data.HIT.HITTypeId;
              myHITId = data.HIT.HITId;

              console.log(data);

              console.log('HIT has been successfully published here: https://workersandbox.mturk.com/mturk/preview?groupId=' + data.HIT.HITTypeId + ' with this HITId: ' + data.HIT.HITId);
          }
      });

      var notifica = {
        Subject: 'Creazione HIT',
        MessageText: 'Grazie per le tue segnalazioni! Al seguente link potrai accettare https://workersandbox.mturk.com/mturk/preview?groupId=' + myHITTypeId,
        WorkerId: '',
      };

      mturk.NotifyWorkers(notifica, function(err, data) {
        if (err) {
          console.log(err.message);
        } else {
          console.log(data);
        }
      });
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

//comportamento di default (404)
app.use(function(request,response){
  /*
  response.signal(404);
  response.write('<h1> Pagina non trovata </h1>');
  response.end();
  */
  //stesso risultato in una riga soltanto
  response.status(404).send('<h1> Pagina non trovata </h1>');
});
//apro server su porta 7777
app.listen(8080,function(){
  console.log('Server aperto: http://localhost:8080');
});
