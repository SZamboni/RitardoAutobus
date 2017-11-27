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
})

//funzione che ritorna le fermate più vicine
app.get('/get-fermate', function (request, response, next) {
    // permetto CORS
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // preparo l'header json
    response.header('Content-Type', 'application/json');
    //stored procedure che trova le fermate più vicine
    var query="CALL ritardoautobus.Nearest("+request.query.latitude+", "+
    request.query.longitude+", "+request.query.scanRange+");";
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
            "idFermata": parser[0][i].IdFermata,
            "nomeFermata": parser[0][i].NomeFermata,
            "latitudine": parser[0][i].Latitudine,
            "longitudine": parser[0][i].Longitudine
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

//Segnalazione dei ritardi
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

/*****
TEEEEEEMPPPPPPPPPP
*********/


/*********************
TTEEEEEEEMMMMPPPPPPPPP
*********************/

/**
 * Interface that given a bus stop returns all the bus that can pass to that bus stop,
 * their next arrive and their delay
 */
app.get('/get-ritardi/:fermata', function (req, res) {
    // allowing CORS in the response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // the content of the response is a JSON so we must set the Content-Type header
    res.header('Content-Type', 'application/json');

    // print the requested bus stop
    console.log("Fermata richiesta: " + req.params.fermata);

    // create a simple response, it is an array called bus and objects in the aray have the
    // attributer name, next_bus and delay
    var bus = {
        bus : [
            {
                "name":"5",
                "next_bus":"12:34",
                "delay":"5"
            },
            {
                "name":"13",
                "next_bus":"12:57",
                "delay":"1"
            }
        ]
    }
    // send the response
    res.send(bus);
});


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
