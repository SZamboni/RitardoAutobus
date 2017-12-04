/**
 * File javascript for the page impostazioni
 */

var serverLocation = "http://localhost:8080";

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
 * Function called when the page is loaded
 */
function load() {
    var title = document.getElementById("title");
    title.innerHTML += leggiCookie("email");

    //scanrange
    var scanRange = leggiCookie("scanRange");
    if(scanRange==null){
      scanRange=500;
    }else{
      scanRange=scanRange*1000;
    }
    var scanSlider = document.getElementById("scanSlider");
    scanSlider.value=scanRange;
    var scanRangeLabel= document.getElementById("scanRangeLabel");
    scanRangeLabel.innerHTML=scanRange;
    scanSlider.oninput = function(){
      scanRangeLabel.innerHTML=this.value;
    };

    //timerange
    var timeRange = leggiCookie("timeRange");
    if(timeRange==null){
      timeRange=40;
    }
    var timeSlider = document.getElementById("timeSlider");
    timeSlider.value=timeRange;
    var timeRangeLabel= document.getElementById("timeRangeLabel");
    timeRangeLabel.innerHTML=timeRange;
    timeSlider.oninput = function(){
      timeRangeLabel.innerHTML=this.value;
    };

    var image = document.getElementById("icona_utente");
    image.src = leggiCookie("linkFoto");
}

/**
 * Function called when the user click the button
 */
function click() {

}

/**
 * Other function
 */
function myFunction() {
    console.log("click");
    var scanSlider = document.getElementById("scanSlider");
    console.log(scanSlider.value);
    var range_km = scanSlider.value /1000.0 // il range in kilometri
    document.cookie = "scanRange=" + range_km;
    var timeSlider = document.getElementById("timeSlider");
    console.log(timeSlider.value);
    document.cookie = "timeRange="+ timeSlider.value;
    var id_turk = document.getElementById("id_turk");
    console.log(id_turk.value);

    // information that will be sendt to the server
    var informations = {
        'id': leggiCookie("userId"),
        //'scanRange': range_km, //non mi interessa il range lato server
        'id_turk': id_turk.value
    }
    console.log("Information that will be sent:\n " + JSON.stringify(informations));

    // sending the information using a XMLHTTPRequest
    var url = serverLocation + "/postImpostazioni";

    // fetch the url
    fetch(url, {
        method: "post", // this is a HTTP POST
        headers: {
            'Content-Type': 'application/json'    // the content is a JSON so we must set the Content-Type header
        },

        // body to send in the request, must convert in string before sending
        body: JSON.stringify(informations)
    })
    .then((response) => { // function executed when the request is finisced
        // parse the response
        var data = response.json();
        return data;
    }).then(function(data){
        //  Redirect the user to the new page
        var newUrl = serverLocation + "/bus-visualization.html";
        document.location.href = newUrl;
    });
}

/**
 * Function called when the user click on the back button
 */
function back() {
    var impostazioniUrl = serverLocation + "/bus-visualization.html";
    document.location.href = impostazioniUrl;
}
