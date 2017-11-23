//semplice editor che permette di runnare query mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'ritardoautobus.c147tajn45vc.us-east-2.rds.amazonaws.com',
  user     : 'ritardoautobus',
  password : 'trentino',
  database : 'ritardoautobus'
});

connection.connect();

connection.query('SELECT * from test', function(err, rows, fields) {
  if (!err)
    console.log('Risultato:\n ', rows);
  else
    console.log('Errore nella query.');
});

connection.end();
