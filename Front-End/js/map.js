
/**
 * Script javascript che contiene la funzione di inizializzazione della mappa,
 * di rilevamento dei cookie, di visualizzazione delle fermate e di visualizzazione di bus e ritardi
 * e di reindirizzamento alla pagina di segnalazione
 *
 * @author Simone Zamboni
 * @date 2017-10-30
 */

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
            //test params
            latitude = 46.06597000;
            longitude = 11.15470000;
            var scanRange = 0.8;
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
            load_fermate(latitude, longitude, scanRange);

        });
    } else {
        alert("Geolocation is not supported by this browser, all the functions will not be available");
    }
}