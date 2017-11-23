//connessione SQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'ritardoautobus.c147tajn45vc.us-east-2.rds.amazonaws.com',
  user     : 'ritardoautobus',
  password : 'trentino',
  database : 'ritardoautobus'
});

//Instanza Express
var express = require('express');
var app=express();

//funzione segnala ritardo
var segnaRitardo = function(params){
  var query = ('INSERT into qualcosa');
  connection.connect();
  connection.Query(query,function (errore){
    if(!errore)
      console.log('Aggiunta riga ai ritardi');
    else
      console.log('Errore nell\'aggiunta dei ritardi');
  })
}
