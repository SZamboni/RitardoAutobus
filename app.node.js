//connessione SQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'ritardoautobus.c147tajn45vc.us-east-2.rds.amazonaws.com',
  user     : 'ritardoautobus',
  password : 'trentino',
  database : 'ritardoautobus'
});

//Istanza Express
var express = require('express');
var app=express();
//Istanza bodyparser per leggere i JSON
var bodyParser= require('body-parser');

//funzione che manda una query generica
var eseguiQuery = function(query){
  connection.connect();
  connection.query(query,function (errore){
    if(!errore)
      console.log('Query eseguita con successo');
    else{
      console.log('Errore nella query');
      console.log(errore);
    }
  })
}

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
app.use(bodyParser.json());

/*********************
TTEEEEEEEMMMMPPPPPPPPP
*********************/


//Gestione login
app.post('/postlogin', function(request,response,next) {
    // print the data arrived
    console.log("JSON received: " + JSON.stringify(request.body));
    // send a response
    response.send("OK");
})


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
    eseguiQuery(query);
    response.status(200).send("Segnalazione aggiunta");
});

/*****
TEEEEEEMPPPPPPPPPP
*********/

/**
 * Interface that receive as parameters the latitude and the longitude and return a JSON
 * with the near bus stop to the coordinares
 */
app.get('/get-fermate', function (request, response) {
    // permetto CORS
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // preparo l'header json
    response.header('Content-Type', 'application/json');

    console.log("Parameters: " + request.query.latitude + " " + request.query.longitude);

    // create a simple response, that is an array called fermate with objects that have the attribute name
    var fermate = {
        fermate : [
            { "name":"Povo-Piazza-Manci"},
            { "name":"Povo-Valoni"}
        ]
    }

    // return the response JSON
    response.send(fermate);
});

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
