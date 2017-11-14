/**
 * Server test
 */

// application requirements
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require("fs");     // to read file
var url = require('url');   // to parse URL

// what application use
app.use(bodyParser.json()); // very important for gettin file in JSON format

/**
 * Simple interfce that return a hello world (for test pourpose)
 */
app.get('/hello', function (req, res) {
  res.send('Hello World!');
});

/**
 * Interface that returns the index page
 */
app.get('/index',function(req,res) {
    
    // read the file index.html
    fs.readFile("../Front-End/index.html", function (error, pgResp) {
        // in case of error return 404
        if (error) {
            res.writeHead(404);
            res.write('Contents you are looking are Not Found');
            // in case of seccess return the page
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(pgResp);
        }
        // ending the connection
        res.end();
    });
}) 

/**
 * Interface that returns the bus visualization page
 */
app.get('/bus-visualization', function (req, res) {

    // read the file bus-visualization.html
    fs.readFile("../Front-End/bus-visualization.html", function (error, pgResp) {
        // in case of error return 404
        if (error) {
            res.writeHead(404);
            res.write('Contents you are looking are Not Found');
        // in case of seccess return the page
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(pgResp);
        }
        // ending the connection
        res.end();
    });
});

/**
 * Interface that return the page to signal the bus, the parameter fermata in the url is not used by the back-end
 */
app.get('/segnala/:fermata', function (req, res) {
    // read the file segnala.html
    fs.readFile("../Front-End/segnala.html", function (error, pgResp) {
        if (error) {
            // in case of error return 404
            res.writeHead(404);
            res.write('Contents you are looking are Not Found');
        } else {
            // in case of seccess return the page
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(pgResp);
        }
        // ending the connection
        res.end();
    });
});

/**
 * Interface that receive as parameters the latitude and the longitude and return a JSON 
 * with the near bus stop to the coordinares
 */
app.get('/get-fermate', function (req, res) {
    // allowing CORS in the response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // the content of the response is a JSON so we must set the Content-Type header
    res.header('Content-Type', 'application/json');

    // using the URL parser to get the parameters in the URL
    var query = url.parse(req.url,true).query;
    console.log("Parameters: " + query.latitude + " " + query.longitude);

    // create a simple response, that is an array called fermate with objects that have the attribute name
    var fermate = {
        fermate : [
            { "name":"Povo-Piazza-Manci"},
            { "name":"Povo-Valoni"}
        ]
    }

    // return the response JSON
    res.send(fermate);
});

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

/**
 * Interface to post the data of the login
 */
app.post('/postlogin', function(req,res) {
    // print the data arrived
    console.log("JSON send: " + JSON.stringify(req.body));
    
    // send a response
    res.send("OK");
})

/**
 * Interface to post the data to signal that the user is on the bus
 */
app.post('/postsalita', function(req,res) {
    // print the data arrived
    console.log("JSON send: " + JSON.stringify(req.body));

    // send a response
    res.send("OK");
})

/**
 * Start the server on the port 3000
 */
app.listen(3000, function () {
  console.log('Server listening at port 3000');
});