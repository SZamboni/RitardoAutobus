/**
 * File javascript for the page impostazioni
 */
/*
var serverLocation = "https://michelebonapace.github.io/RitardoAutobus/";
var nodeLocation = "https://floating-eyrie-45682.herokuapp.com/";
*/

var serverLocation = "http://localhost:8080/";
var nodeLocation = "http://localhost:8080/";

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
        document.location.href = serverLocation;
    } else {
        console.log("User logged in");
    }

    load_info();
}

/**
 * Function called when the page is loaded
 */
function load_info() {
    var title = document.getElementById("title");
    title.innerHTML += leggiCookie("email");

    var image = document.getElementById("icona_utente");
    image.src = leggiCookie("linkFoto");
    var areaRemunerazioni = document.getElementById("areaRemunerazioni");
    console.log(leggiCookie("userId"));
    var url=nodeLocation+"turkid/?userId="+leggiCookie("userId");
    fetch(url,{
      method:"get",
      headers: {
          'Content-Type': 'application/json'
      },
    }).then ((response) => {
        var data= response.json();
        return data;
    }).then ((data) =>{
      console.log(data.WorkerId);
      var turkField = document.getElementById("id_turk");
      if(data.WorkerId!=null){
        turkField.value=data.WorkerId;
        oldTurk=data.WorkerId;
      }
    });
}

/**
 * Function called when the user click on the back button
 */
function back() {
    document.location.href = serverLocation + "bus-visualization.html";
}
