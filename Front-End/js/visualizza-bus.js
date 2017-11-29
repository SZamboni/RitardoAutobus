/**
 * Function that returns a value of a defined cookie or undefined if that cookie is not found
 */
var serverLocation = "http://localhost:8080";

var stops;

/**
 * Function that given a cookie name controls if there is that cookie
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
 * Function that ckeck if the user is logged in
 */
function load() {
    var id = leggiCookie("userId");

    if(id == undefined) {
        console.log("User not logged in");;
        document.location.href = serverLocation;
    } else {
        console.log("User logged in");
    }
}

/**
 * Function that init the map with the information of the stops
 */
function initMap() {

    // check if the geolocation is enabled
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( function(position) {

            // get the coordinates
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            /**
            //dati test
            var latitude = 46.06597000 ;
            var longitude = 11.1547000;
            //Piazza manci coordinates: latitude=46.06597000; longitude=11.15470000;
            **/

            var scanRange=0.5;
            var myLatLng = {lat: latitude, lng: longitude};

            var url_load_fermate = serverLocation + "/get-fermate/?latitude="+ latitude + "&longitude=" + longitude + "&scanRange=" + scanRange;
            // get the stops list
            fetch(url_load_fermate)
            .then((response) => {   // elaboro il risultato trasformandolo in json con la funzione json() che ritorna una promise
                        data = response.json();
                        return data;
            }).then(function (data) {   // elaboro il json

                // create the map and set the zoom and the center
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 16,
                    center: myLatLng
                });

                // create and initialize the marker of the stops
                for(var i = 0; i < data.fermate.length; i++) {
                    var pos = { lat : parseFloat(data.fermate[i].latitudine), lng : parseFloat(data.fermate[i].longitudine)};
                    var m = new google.maps.Marker({
                        position : pos,
                        map : map,
                        title : data.fermate[i].nomeFermata,
                        icon : "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    })
                }

                // create and inizialize the position marker
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: 'La tua Posizione'
                });

                // go ahead with the elaboration
                caricaRitardi(data.fermate);

            })
            .catch(error => console.error(error))  // error handling

        });
    } else {
        alert("Geolocation is not supported by this browser, all the functions will not be available");
    }
}

/**
 * Function that creates the visualization of the stops
 */
function caricaRitardi(fermate) {

    stops = fermate;
    console.log(stops);
    for(var i = 0; i < stops.length; i++) {
        stops[i].lineeRitardi = [];
    }

    for(var i = 0; i < fermate.length; i++) {

        fetch(serverLocation + "/get-ritardi/?idFermata=" + fermate[i].idFermata + "&rangeTempo=\'00:40:00\'")     // get the list of bus and their delay
        .then((response) => {
            data = response.json();
            return data;
        }).then(function (data) {

            for(var j = 0; j < stops.length; j++) {
                if(stops[j].idFermata == data.lineeRitardi[0].idFermata) {
                    stops[j].lineeRitardi = data.lineeRitardi;
                    stops[j].idCorsa = data.lineeRitardi[0].idCorsa;
                }
            }

            visualize();

        }).catch(error => console.error(error));

    }

}

/**
 * Function that segnal the information to the server
 */
function click(_idFermata,_idLinea, _idCorsa, _latFermata, _lonFermata) {
    console.log("fermata: " + _idFermata + " linea: " + _idLinea);

    var data = new Date(Date.now());
    data.setHours(data.getHours() + 1); //fix alla timezone

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( function(position) {

            // get the coordinates
            var latitude = position.coords.latitude;   //position.coords.latitude
            var longitude = position.coords.longitude;   //position.coords.longitude
            /**
            //dati test
            var latitude = 46.06597000 ;
            var longitude = 11.1547000;
            //Piazza manci coordinates: latitude=46.06597000; longitude=11.15470000;
            **/
            console.log("Coord utente: "+latitude+" "+longitude);
            console.log("Coord fermata: "+_latFermata+" "+_lonFermata);
            console.log("Id Corsa: "+_idCorsa);
            var informations = {
                idLinea: _idLinea,
                idFermata: _idFermata,
                idCorsa: _idCorsa,
                idUtente: leggiCookie("userId"),
                latUtente : latitude,
                lonUtente : longitude,
                latFermata : _latFermata,
                lonFermata : _lonFermata,
                dataOra : data
            }

            //console.log(informations);

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

            });
        })
    }


}

/**
 * Function that visualize stops and bus
 */
function visualize() {

    // remove the old visualization
    var old_div = document.getElementById("parent");
    if(old_div != undefined) {
        old_div.parentNode.removeChild(old_div);
    }

    original = document.getElementById("selezione-fermate");

    parent = document.createElement('div');
    parent.id = "parent";

    for(var i = 0; i < stops.length; i++) {

        var div = document.createElement('div');
        div.innerHTML = stops[i].nomeFermata;
        div.id = stops[i].idFermata;

        var table = document.createElement('table');



        for(var j = 0; j < stops[i].lineeRitardi.length; j++) {

            var tr = document.createElement('tr');

            var bus = document.createElement("td");
            bus.innerHTML = stops[i].lineeRitardi[j].nomeLinea;
            tr.appendChild(bus);

            var next = document.createElement("td");
            next.innerHTML = stops[i].lineeRitardi[j].orario;
            tr.appendChild(next);

            var delay = document.createElement("td");
            delay.innerHTML = stops[i].lineeRitardi[j].ritardo + " min";
            tr.appendChild(delay);

            var buttoncell = document.createElement("td");
            var button = document.createElement('button');
            button.idFermata = stops[i].idFermata;
            button.idLinea = stops[i].lineeRitardi[j].idLinea;
            button.idCorsa = stops[i].idCorsa;
            button.latFermata = stops[i].latitudine;
            button.lonFermata = stops[i].longitudine;
            button.onclick = function () {   // the function called when the button is press
                click(this.idFermata, this.idLinea, this.idCorsa, this.latFermata, this.lonFermata);
            };
            button.innerHTML = "Segnala Salita";
            buttoncell.appendChild(button);
            tr.appendChild(buttoncell);

            table.appendChild(tr);
        }

        div.appendChild(table);

        parent.appendChild(div);
        original.appendChild(parent);
    }



    /*

    var selection = document.createElement("select");   // create the selection box
    selection.id = "selection";

    // create the options of the selection
    for (var i = 0; i < data.fermate.length; i++) {
        var option = document.createElement("option");
        option.value = data.fermate[i].idFermata;
        option.innerHTML = data.fermate[i].nomeFermata;
        selection.appendChild(option);
    }

    var selezione_fermate = document.getElementById("selezione-fermate");
    selezione_fermate.appendChild(selection);   // append all toghether
    var parte = document.createElement('div');
    parte.innerHTML = fermate[i].nomeFermata;
    var table = document.createElement('table');

    for( var j = 0; j < data.lineeRitardi.length; j++){
        var tr = document.createElement("tr");  // create the row

        var bus = document.createElement("td");
        bus.innerHTML = data.lineeRitardi[j].nomeLinea;
        tr.appendChild(bus);

        var next = document.createElement("td");
        next.innerHTML = data.lineeRitardi[j].orario;
        tr.appendChild(next);

        var delay = document.createElement("td");
        delay.innerHTML = data.lineeRitardi[j].ritardo + " min";
        tr.appendChild(delay);

        table.appendChild(tr);  // append the row to the table
    }

    parte.appendChild(table);

    parent.appendChild(parte);
    */
}

/**
 * Function that request for a bus stop all the bus with their delay
 */
function richiesta_bus() {
    /*
    var selection = document.getElementById("selection");
    console.log(selection[selection.selectedIndex].value);
    var selected_item = selection[selection.selectedIndex].value;   // get the selected item

    fetch(serverLocation + "/get-ritardi/?idFermata=" + selected_item + "&rangeTempo=\'00:40:00\'")     // get the list of bus and their delay
            .then((response) => {
                data = response.json();
                return data;
            }).then(function (data) {
        console.log("Bus per fermata selezionata: " + JSON.stringify(data, null, 4));

        var bus_e_ritardi = document.getElementById("bus-e-ritardi");   // tha tag where the table will be attached

        var old_table = document.getElementById("table");   // delete the old table if there is any
        if (old_table != undefined) {
            old_table.parentNode.removeChild(old_table);
        }

        var table = document.createElement("table");    // create the table
        table.id = "table";

        var intestazione_colonne = document.createElement("tr");    // the description of the columns

        var codice_bus = document.createElement("th");  // first column: the code of the bus
        codice_bus.innerHTML = "Autobus";
        intestazione_colonne.appendChild(codice_bus);

        var prossimo_bus = document.createElement("th"); // second column: the next bus of that kind
        prossimo_bus.innerHTML = "Prossimo";
        intestazione_colonne.appendChild(prossimo_bus);

        var ritardo = document.createElement("th"); // third column: the delay of the next bus of that kind
        ritardo.innerHTML = "Ritardo";
        intestazione_colonne.appendChild(ritardo);

        table.appendChild(intestazione_colonne);

        // for every bus we create a row in the table wit all the informatio from the server
        for (var i = 0; i < data.lineeRitardi.length; i++) {

            var tr = document.createElement("tr");  // create the row

            var bus = document.createElement("td");
            bus.innerHTML = data.lineeRitardi[i].nomeLinea;
            tr.appendChild(bus);

            var next = document.createElement("th");
            next.innerHTML = data.lineeRitardi[i].orario;
            tr.appendChild(next);

            var delay = document.createElement("th");
            delay.innerHTML = data.lineeRitardi[i].ritardo + " min";
            tr.appendChild(delay);

            table.appendChild(tr);  // append the row to the table

        }
        bus_e_ritardi.appendChild(table);   // appen the table to the tag
    })
    .catch(error => console.error(error)); */
}

/**
 * Function that redirect the user to the signal page
 */
function segnala() {
    var selection = document.getElementById("selection");
    var selected_item = selection[selection.selectedIndex].value;   // get the selected item
    var newUrl = serverLocation + "/segnala.html?fermata=" + selected_item;
    document.location.href = newUrl;
}
