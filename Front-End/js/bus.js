/**
 * Script javascript che contiene la lattura dei cookie, il reindirizzamento alla visualizzazione dei bus,
 * la funzione di invio dati di salita al server e il caricamento dei bus possibili per quella fermata
 *        
 */
'use strict';

var serverLocation = "http://localhost:8080";  // variable that store the location of the server

/**
 * Function that returns a value of a defined cookie or undefined if that cookie is not found
 */
function leggiCookie(nomeCookie) {

    if (document.cookie.length > 0) {
        var inizio = document.cookie.indexOf(nomeCookie + "=");

        if (inizio !== -1) {
            inizio = inizio + nomeCookie.length + 1;
            var fine = document.cookie.indexOf(";", inizio);

            if (fine === -1) {
                fine = document.cookie.length;
            }

            return unescape(document.cookie.substring(inizio, fine));

        } else {
            return undefined;
        }
    }
    return undefined;
}

/**
 * Function called when a bus button is pressed and send the data to the server
 */
var click = function (data) {
    var data = new Date(Date.now());
    data.setHours(data.getHours() + 1); //fix alla timezone
    var url = document.URL;
    /*
     ma perchè T_T
     var _fermata = url.substr(30);
     */
    //prendo la fermata con get
    var url = new URL(window.location);
    var _fermata = url.searchParams.get('fermata');
    console.log(_fermata);
    var _mail = leggiCookie("email");

    // information that will be sent to the server
    var informations = {
        bus: 0,
        dataOra: data,
        email: _mail
    }

    console.log(informations);

    var destination_url = serverLocation + "/postsalita";

    // fetch the url
    fetch(destination_url, {
        method: "post", // this is a HTTP POST
        headers: {
            'Content-Type': 'application/json'    // the content is a JSON so we must set the Content-Type header
        },

        // body to send in the request, must convert in string before sending
        body: JSON.stringify(informations)
    })
            .then((response) => { // function executed when the request is finisced
                //  Redirect the user to the new page
                var newUrl = serverLocation + "/bus-visualization";
                document.location.href = newUrl;
            });

};

/**
 * Function that load all the bus for this bus stop
 */
function load_bus() {
    // extract the bus stop from the URL
    //var url = document.URL;
    /*
     Cos'è sta roba?
     var fermata = url.substr(30);
     */
    //SEGUO LO STANDARD: USO GET NEL MODO IN CUI DEVE ESSERE USATO
    //prendo la fermata con get
    var url = new URL(window.location);
    var fermata = url.searchParams.get('fermata');//<------------così
    console.log(fermata);
    // get the bus for that bus stop
    fetch(serverLocation + "/get-ritardi/" + fermata)     // get the list of bus and their delay
            .then((response) => {   // elaboro il risultato trasformandolo in json con la funzione json() che ritorna una promise
                data = response.json();

                return data;
            }).then(function (data) {
        console.log("Bus per fermata selezionata: " + JSON.stringify(data, null, 4));

        var selezione = document.getElementById("selezione autobus");

        // for every bus create a button
        for (var i = 0; i < data.bus.length; i++) {
            var button = document.createElement("button");
            button.id = data.bus[i].name;
            button.innerHTML = data.bus[i].name;

            button.onclick = function () {   // the function called when the button is press
                click(this.id);
            };

            var br = document.createElement("br");

            selezione.appendChild(br);
            selezione.appendChild(button);
        }
    })
            .catch(error => console.error(error));
}

/**
 * Script javascript che contiene la funzione di inizializzazione della mappa,
 * di rilevamento dei cookie, di visualizzazione delle fermate e di visualizzazione di bus e ritardi
 * e di reindirizzamento alla pagina di segnalazione
 var serverLocation = "http://localhost:8080";  // variable that store the location of the server
 
 /**
 * Google function to init map
 */
function initMap() {

    // check if the geolocation is enabled
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            // get the coordinates
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            console.log(latitude);
            console.log(longitude);
            var myLatLng = {lat: latitude, lng: longitude};

            // create the map and set the zoom and the center
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: myLatLng
            });
            // create and inizialize the marker
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: 'La tua Posizione'
            });

            // based on the coordinates load nearby bus stops
            load_fermate(latitude, longitude);

        });
    } else {
        alert("Geolocation is not supported by this browser, all the functions will not be available");
    }
}


