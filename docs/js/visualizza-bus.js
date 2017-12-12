/**
 * Function that returns a value of a defined cookie or undefined if that cookie is not found
 */

 /*
  var serverLocation = "https://michelebonapace.github.io/RitardoAutobus/";
  var nodeLocation = "https://floating-eyrie-45682.herokuapp.com/";
 */

  var serverLocation = "http://localhost:8080/";
  var nodeLocation = "http://localhost:8080/";

var stops;
var map = null;
var marker = null;
var cerchioPosizione = null;
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
    console.log(id);
    if(id == undefined) {
        console.log("User not logged in");
        //creo login button
        var loginbtn = document.createElement("BUTTON");
        loginbtn.className += "searchbar";        // Create a <button> element
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
      settingsLoad();
      loadRemunerazioni();
      console.log("User logged in");
      var menuImpostazioni = document.getElementById("menuImpostazioni");
      menuImpostazioni.style.display= "block";
      var menuNotifiche = document.getElementById("menuNotifiche");
      menuNotifiche.style.display= "block";
      var notify = document.getElementById("menuNotifiche").firstChild;
      fetch(nodeLocation+"hits/unreadamount/?userId="+id).then((response)=>{
        data=response.json();
        return data;
      }).then((data)=>{
        //console.log(data);
        //console.log(data.Conteggio);
        notify.innerHTML = "&#9776; NOTIFICHE ("+data.Conteggio+")";/*
        if(data.Conteggio!=0){
          notify.innerHTML="Hai "+data.Conteggio+" notifiche da leggere.";
        }else{
          notify.innerHTML="Nessuna notifica da leggere."
        }
        */
      });

      //creo logout button
      var logoutbtn = document.createElement("BUTTON");
      logoutbtn.className += "searchbar";        // Create a <button> element
      var t = document.createTextNode("LOG OUT");
      logoutbtn.appendChild(t);
      logoutbtn.onclick = signOut;
      document.getElementById("logDiv").appendChild(logoutbtn);
      /*
      //creo pulsante impostazioni
      var impostazionibtn = document.createElement("BUTTON");        // Create a <button> element
      var t = document.createTextNode("impostazioni");
      impostazionibtn.appendChild(t);
      impostazionibtn.onclick = clickImpostazioni;
      document.getElementById("impostazioniDiv").appendChild(impostazionibtn);
      */
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
            var latitude = position.coords.latitude;   //position.coords.latitude
            var longitude = position.coords.longitude;   //position.coords.longitude
            //var latitude = 46.0667069;
            //var longitude = 11.1655039;

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

        fetch(nodeLocation + "ritardi/?idFermata=" + fermate[i].idFermata + "&rangeTempo=\'"+delayRange+"\'")     // get the list of bus and their delay
        .then((response) => {
            data = response.json();
            return data;
        }).then(function (data) {
            if(data.lineeRitardi[0]!=null){
              for(var j = 0; j < stops.length; j++) {
                  if(stops[j].idFermata == data.lineeRitardi[0].idFermata) {
                      stops[j].lineeRitardi = data.lineeRitardi;
                      stops[j].idCorsa = data.lineeRitardi[0].idCorsa;
                  }
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
            //var latitude = 46.0667069;
            //var longitude = 11.1655039;

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
                alert("Segnalazione ricevuta");
            });
        })
    }
}
function aggiorna(){
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition( function(position) {
          // get the coordinates
          var latitude = position.coords.latitude;   //position.coords.latitude
          var longitude = position.coords.longitude;   //position.coords.longitude
          //var latitude = 46.0667069;
          //var longitude = 11.1655039;

          /**Mettere // all'inizio di questa linea per attivare i dati test
          //dati test
          var latitude = 46.06597000 ;
          var longitude = 11.1547000;
          //Piazza manci coordinates: latitude=46.06597000; longitude=11.15470000;
          //**/

          var scanRange= leggiCookie("scanRange");
          if(scanRange==null){
            scanRange=0.5;//il range di default è 500m
          }
          console.log(scanRange);

          var myLatLng = {lat: latitude, lng: longitude};
          placeMarker(myLatLng,scanRange);

          var url_load_fermate = nodeLocation + "fermate/?latitude="+ latitude + "&longitude=" + longitude + "&scanRange=" + scanRange;
          // get the stops list
          fetch(url_load_fermate)
          .then((response) => {   // elaboro il risultato trasformandolo in json con la funzione json() che ritorna una promise
                      data = response.json();
                      return data;
          }).then(function (data) {   // elaboro il json



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
function placeMarker(location,scanRange) {
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

    if(cerchioPosizione == null){
      cerchioPosizione = new google.maps.Circle({
          strokeColor: '#0000FF',
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: '#0000FF',
          fillOpacity: 0.15,
          map: map,
          center: location,
          radius: scanRange  * 1000
      });
    }else{
      cerchioPosizione.setCenter(location);
      cerchioPosizione.setRadius(scanRange*1000);
    }
  }
/*
Funzione che gestisce il collapse dei ritardi
*/
/*
function collapse(){
    var collapser=this.parentNode.lastChild;
    var sizer= collapser.firstChild;
    if(collapser.clientHeight){
      collapser.style.height = 0;
    }else{
      collapser.style.height = sizer.clientHeight + "px";
    }
}
*/
/**
 * Function that visualize stops and bus
 */
function visualize() {

    // remove the old visualization
    var old_div = document.getElementById("tabellaFermate");
    var original = document.getElementById("selezione-fermate");
    if(old_div != undefined) {
        original.removeChild(old_div);
    }

    var tabellaFermate = document.createElement('div');
    tabellaFermate.id = "tabellaFermate";

    for(var i = 0; i < stops.length; i++) {
        var fermataContainer = document.createElement('div');
        fermataContainer.classList.add('fermataContainer');
        var fermataSizer = document.createElement('div');
        fermataSizer.classList.add('fermataSizer');
        var fermataHead = document.createElement('div');
        fermataHead.id= "fermataname"
        fermataHead.classList.add('fermataHead');
        fermataHead.innerHTML = stops[i].nomeFermata;
        fermataHead.id = stops[i].idFermata;
        fermataHead.onclick = function(){
          var collapser=this.parentNode.lastChild;
          var sizer= collapser.firstChild;
          if(collapser.clientHeight){
            collapser.style.height = 0;
          }else{
            collapser.style.height = sizer.clientHeight + "px";
          }
        };
        fermataContainer.appendChild(fermataHead);
        for(var j = 0; j < stops[i].lineeRitardi.length; j++) {

            var rigaRitardo = document.createElement('div');
            rigaRitardo.classList.add('rigaRitardo');
            var bus = document.createElement("div");
            bus.id= "tratta"
            bus.innerHTML = stops[i].lineeRitardi[j].nomeLinea;
            rigaRitardo.appendChild(bus);

            var next = document.createElement("div");
            next.id= "orario"
            var orario = stops[i].lineeRitardi[j].orario.split(":");
            next.innerHTML = orario[0]+":"+orario[1];
            rigaRitardo.appendChild(next);

            var delay = document.createElement("div");
            delay.id= "ritardo"
            var testoRitardo="";
            var ritardo = stops[i].lineeRitardi[j].ritardo.split(":");
            var coloreRitardo = "#FF3300";
            if(parseInt(ritardo[1])<5){
              coloreRitard="#FF9900";
            }
            if(parseInt(ritardo[1])<2){
              coloreRitardo="#00CC00";
            }
            if(stops[i].lineeRitardi[j].ritardo[0]=="-"){
              testoRitardo = testoRitardo + "-";
            }else{
              testoRitardo = testoRitardo + "+";
            }
            testoRitardo = testoRitardo + parseInt(ritardo[1])+ ":"+ritardo[2];
            delay.innerHTML = testoRitardo + " min";
            delay.style.color = coloreRitardo;
            rigaRitardo.appendChild(delay);

            if(leggiCookie("userId") != undefined) {
              var buttoncell = document.createElement("div");
              buttoncell.id="bottonesegnala"
              var button = document.createElement('button');
              button.idFermata = stops[i].idFermata;
              button.idLinea = stops[i].lineeRitardi[j].idLinea;
              button.idCorsa = stops[i].lineeRitardi[j].idCorsa;
              button.latFermata = stops[i].latitudine;
              button.lonFermata = stops[i].longitudine;
              button.onclick = function () {   // the function called when the button is press
                  click(this.idFermata, this.idLinea, this.idCorsa, this.latFermata, this.lonFermata);
              };
              button.innerHTML = "Segnala Salita";
              buttoncell.appendChild(button);
              rigaRitardo.appendChild(buttoncell);
              rigaRitardo.id= "rigadelayBot";
            }else{
              rigaRitardo.id= "rigadelayNoBot";
            }
            fermataSizer.appendChild(rigaRitardo);
        }
        if(stops[i].lineeRitardi.length==0){
            var nessunaCorsa = document.createElement("div");
            nessunaCorsa.classList.add("nessunaCorsa");
            nessunaCorsa.innerHTML = "Nessuna corsa programmata per la fermata."
            fermataSizer.appendChild(nessunaCorsa);
        }

        var fermataCollapser = document.createElement("div");
        fermataCollapser.classList.add("fermataCollapser");
        fermataCollapser.appendChild(fermataSizer);
        fermataContainer.appendChild(fermataCollapser);
        tabellaFermate.appendChild(fermataContainer);
    }
    original.appendChild(tabellaFermate);

}

/**
 * Function that request for a bus stop all the bus with their delay
 */
function clickImpostazioni() {
    var impostazioniUrl = serverLocation + "impostazioni.html";
    document.location.href = impostazioniUrl;
}

setInterval(aggiorna,60000);
