/**
 * Function that returns a value of a defined cookie or undefined if that cookie is not found
 */
var serverLocation = "http://localhost:8080";

        function initMap() {
            // check if the geolocation is enabled
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition( function(position) {
                    // get the coordinates
                    var latitude =  position.coords.latitude;
                    var longitude = position.coords.longitude;
                    console.log(latitude);
                    console.log(longitude);
                    //test params
                    //latitude=46.06597000;
                  //  longitude=11.15470000;
                    var scanRange=0.8;
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
                    //parametri: lat, long, range scan in kms
                    load_fermate(latitude,longitude,scanRange);
                });
            } else {
                alert("Geolocation is not supported by this browser, all the functions will not be available");
            }
        }
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
 * Function that request to the server the nearest bus stop
 */
function load_fermate(latitude, longitude, scanRange) {

    var email = leggiCookie("email");

    var url_load_fermate = serverLocation + "/get-fermate/?latitude="
            + latitude + "&longitude=" + longitude + "&scanRange=" + scanRange;
    fetch(url_load_fermate)
            .then((response) => {   // elaboro il risultato trasformandolo in json con la funzione json() che ritorna una promise
                data = response.json();
                return data;
            }).then(function (data) {   // elaboro il json
        console.log("Data received: " + JSON.stringify(data, 4));
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
    })
            .catch(error => console.error(error))  // error handling
}

/**
 * Function that request for a bus stop all the bus with their delay
 */
function richiesta_bus() {
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
            .catch(error => console.error(error));
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