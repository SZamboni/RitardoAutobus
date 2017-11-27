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
            option.value = data.fermate[i].nomeFermata;
            option.innerHTML = data.fermate[i].nomeFermata;
            selection.appendChild(option);
        }

        var selezione_fermate = document.getElementById("selezione-fermate");
        selezione_fermate.appendChild(selection);   // append all toghether
    })
            .catch(error => console.error(error));  // error handling
}

/**
 * Function that request for a bus stop all the bus with their delay
 */
function richiesta_bus() {
    var selection = document.getElementById("selection");
    var selected_item = selection[selection.selectedIndex].value;   // get the selected item

    fetch(serverLocation + "/get-ritardi/" + selected_item)     // get the list of bus and their delay
            .then((response) => {
                data = response.json();
                return data;
            }).then(function (data) {
        console.log("Bus per fermata selezionata: " + JSON.stringify(data, null, 4));

        var bus_e_ritardi = document.getElementById("bus-e-ritardi");   // tha tag where the table will be attached

        var old_table = document.getElementById("table");   // delete the old table if there is any
        if (old_table !== undefined) {
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
        for (var i = 0; i < data.bus.length; i++) {

            var tr = document.createElement("tr");  // create the row

            var bus = document.createElement("td");
            bus.innerHTML = data.bus[i].name;
            tr.appendChild(bus);

            var next = document.createElement("th");
            next.innerHTML = data.bus[i].next_bus;
            tr.appendChild(next);

            var delay = document.createElement("th");
            delay.innerHTML = data.bus[i].delay + " min";
            tr.appendChild(delay);

            table.appendChild(tr);  // append the row to the table

        }
        bus_e_ritardi.appendChild(table);   // appen the table to the tag
    })
            .catch(error => console.error(error));
}

function segnala() {
    var selection = document.getElementById("selection");
    var selected_item = selection[selection.selectedIndex].value;   // get the selected item
    var newUrl = serverLocation + "/segnala.html?fermata=" + selected_item;
    document.location.href = newUrl;
}