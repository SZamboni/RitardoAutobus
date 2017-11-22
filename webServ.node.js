var express = require('express');
var webServ=express();
//pagine normali
var pag1= function(request,response){
  response.writeHead(200);
  response.write('<h1> Pagina 1 </h1>');
  response.end();
};
webServ.get('/pag1',pag1);
webServ.get('/pagina1',pag1)
webServ.get('/pag2',function(request,response){
  response.writeHead(200);
  response.write('<h1> Pagina 2 </h1>');
  response.end();
});
//comportamento di default (404)
webServ.use(function(request,response){
  response.writeHead(404);
  response.write('<h1> Pagina non trovata </h1>');
  response.end();
});
//apro server su porta 7777
webServ.listen(7777,function(){
  console.log('Server aperto: http://localhost:7777');
});
