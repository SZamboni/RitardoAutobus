/**
 * Script javascript che contiene la lattura dei cookie, il reindirizzamento alla visualizzazione dei bus,
 * la funzione di invio dati di salita al server e il caricamento dei bus possibili per quella fermata
 */

 /*
 var serverLocation = "https://michelebonapace.github.io/RitardoAutobus/";
 var nodeLocation = "https://floating-eyrie-45682.herokuapp.com/";
 */
 var serverLocation = "http://localhost:8080/";
 var nodeLocation = "http://localhost:8080/";
 
/**
 * Function that returns a value of a defined cookie or undefined if that cookie is not found
 */
function leggiCookie(nomeCookie) {

    if (document.cookie.length > 0) {
        var inizio = document.cookie.indexOf(nomeCookie + "=");

        if (inizio != -1) {
            inizio = inizio + nomeCookie.length + 1;
            var fine = document.cookie.indexOf(";", inizio);

            if (fine == -1) {
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

    var destination_url = nodeLocation + "salita/";

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
                var newUrl = serverLocation + "bus-visualization";
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
    fetch(nodeLocation + "ritardi/" + fermata)     // get the list of bus and their delay
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
