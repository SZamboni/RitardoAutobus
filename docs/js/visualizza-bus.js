/**
 * Function that returns a value of a defined cookie or undefined if that cookie is not found
 */
var serverLocation = "http://localhost:8080";

var stops;
var map = null;
var marker = null;
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
        console.log("User not logged in");

        //creo login button
        var loginbtn = document.createElement("BUTTON");        // Create a <button> element
        var t = document.createTextNode("LOG IN");
        loginbtn.appendChild(t);
        loginbtn.onclick = openLogin;
        document.getElementById("logDiv").appendChild(loginbtn);
        /*
        old_button = document.getElementById("impostazioni");
        if(old_button != undefined) {
            old_button.parentNode.removeChild(old_button);
        }*/
    } else {
      console.log("User not logged in");

      //creo logout button
      var logoutbtn = document.createElement("BUTTON");        // Create a <button> element
      var t = document.createTextNode("LOG OUT");
      logoutbtn.appendChild(t);
      logoutbtn.onclick = signOut;
      document.getElementById("logDiv").appendChild(logoutbtn);

      //creo pulsante impostazioni
      var impostazionibtn = document.createElement("BUTTON");        // Create a <button> element
      var t = document.createTextNode("impostazioni");
      impostazionibtn.appendChild(t);
      impostazionibtn.onclick = clickImpostazioni;
      document.getElementById("impostazioniDiv").appendChild(impostazionibtn);
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

            var myLatLng = {lat: latitude, lng: longitude};
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: myLatLng
            });
            aggiorna();
      });
    } else {
        alert("Geolocation is not supported by this browser, all the functions will not be available");
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: {lat: 46.0673076, lng: 11.1212993}
        });
    }

}

/**
 * Function that creates the visualization of the stops
 */
function caricaRitardi(fermate) {
    var timeRange= leggiCookie('timeRange');
    if(timeRange==null){
      timeRange=40;//il delayRange di default è 40m
    }
    var min=timeRange%60;
    var hrs=(timeRange-min)/60;
    if(min<10){
      min="0"+min;
    }
    if(hrs<10){
      hrs="0"+hrs;
    }
    delayRange=hrs+":"+min+":00";
    console.log(delayRange);
    stops = fermate;
    console.log(stops);
    for(var i = 0; i < stops.length; i++) {
        stops[i].lineeRitardi = [];
    }

    for(var i = 0; i < fermate.length; i++) {

        fetch(serverLocation + "/ritardi/?idFermata=" + fermate[i].idFermata + "&rangeTempo=\'00:40:00\'")     // get the list of bus and their delay
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

            /**Mettere // all'inizio di questa linea per attivare i dati test
            //dati test
            var latitude = 46.06597000 ;
            var longitude = 11.1547000;
            //Piazza manci coordinates: latitude=46.06597000; longitude=11.15470000;
            //**/

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

            var destination_url = serverLocation + "/salita/";

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
function aggiorna(){
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition( function(position) {
          // get the coordinates
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;

          var scanRange= leggiCookie("scanRange");
          if(scanRange==null){
            scanRange=0.5;//il range di default è 500m
          }
          console.log(scanRange);
          var myLatLng = {lat: latitude, lng: longitude};
          placeMarker(myLatLng);
          var url_load_fermate = serverLocation + "/fermate/?latitude="+ latitude + "&longitude=" + longitude + "&scanRange=" + scanRange;
          // get the stops list
          fetch(url_load_fermate)
          .then((response) => {   // elaboro il risultato trasformandolo in json con la funzione json() che ritorna una promise
                      data = response.json();
                      return data;
          }).then(function (data) {

            for(var i = 0; i < data.fermate.length; i++) {
                var pos = { lat : parseFloat(data.fermate[i].latitudine), lng : parseFloat(data.fermate[i].longitudine)};
                var m = new google.maps.Marker({
                    position : pos,
                    map : map,
                    title : data.fermate[i].nomeFermata,
                    icon : "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                })
            }
            // go ahead with the elaboration
            caricaRitardi(data.fermate);

            })
            .catch(error => console.error(error))  // error handling

            });
            console.log("aggiorno");
        }
        else {
          alert("Geolocation is not supported by this browser, all the functions will not be available");
        }
}

/*
funzione che aggiorna la posizione dell'utente
*/
function placeMarker(location) {
    if (marker == null)
        marker = new google.maps.Marker({
            position: location,
            draggable: true,
            animation: google.maps.Animation.DROP,
            map: map,
            title: 'La tua Posizione'
        });
    else {
        marker.setPosition(location);
    }
    marker.setAnimation(null);
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

            if(leggiCookie("userId") != undefined) {
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
            }

            table.appendChild(tr);
        }

        div.appendChild(table);

        parent.appendChild(div);
        original.appendChild(parent);
    }


}

/**
 * Function that request for a bus stop all the bus with their delay
 */
function clickImpostazioni() {
    var impostazioniUrl = serverLocation + "/impostazioni.html";
    document.location.href = impostazioniUrl;
}

setInterval(aggiorna,60000);