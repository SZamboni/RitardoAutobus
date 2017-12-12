const app = require('./app.node.js');

//apro server su porta 8080
//heroku vuole ascoltare sulla sua porta
var porta = process.env.PORT || 3000;
//var porta = 8080;
app.listen(porta, function () {
    console.log('Server aperto');
});
