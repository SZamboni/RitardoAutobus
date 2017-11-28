var express = require('express');
var app=express();
//pagine statiche
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
app.listen(7777,function(){
  console.log('Server aperto: http://localhost:7777');
});
