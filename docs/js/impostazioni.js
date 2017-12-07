/**
 * File javascript for the page impostazioni
 */
/*
var serverLocation = "https://michelebonapace.github.io/RitardoAutobus/";
var nodeLocation = "https://floating-eyrie-45682.herokuapp.com/";
*/
var serverLocation = "http://localhost:8080/";
var nodeLocation = "http://localhost:8080/";


var oldTurk;
var oldTime;
var oldRange;
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

    load_info();
}

/**
 * Function called when the page is loaded
 */
function load_info() {
    var title = document.getElementById("title");
    title.innerHTML += leggiCookie("email");

    //scanrange
    var scanRange = leggiCookie("scanRange");
    oldRange=scanRange;
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
    oldTime=timeRange;
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
 * Function called when the user click the button
 */
function click() {

}

/**
 * Other function
 */
function applySettings() {
    var alert="";
    //console.log("click");
    //mi prendo lo slider dello scan
    var scanSlider = document.getElementById("scanSlider");
    //console.log(scanSlider.value);
    //aggiorno il cookie solo se necessario
    if(oldRange==null || (oldRange*1000)!=scanSlider.value){
      console.log("Range aggiornato in "+ scanSlider.value/1000.0);
      document.cookie = "scanRange=" + scanSlider.value /1000.0;
      oldRange=scanSlider.value/1000.0;
      alert=alert+"Range aggiornato.\n";
    }
    //mi prendo lo slider del tempo
    var timeSlider = document.getElementById("timeSlider");
    //console.log(timeSlider.value);
    //aggiorno il cookie solo se necessario
    if(oldTime==null || oldTime!=timeSlider.value){
      console.log("Tempo aggiornato in "+timeSlider.value);
      document.cookie = "timeRange="+ timeSlider.value;
      oldTime=timeSlider.value;
      alert=alert+"Tempo aggiornato.\n";
    }
    var turkField = document.getElementById("id_turk");
    if (turkField.value!=oldTurk){
      //devo aggiornare il turkId. Preparo i dati da passare nel post
      var body={
        "userId" : leggiCookie("userId"),
        "workerId" : turkField.value
      };
      //console.log(body);
      var url=nodeLocation+"turk/";
      fetch(url,{
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((response)=>{
        if(response.status!=200){
          alert=alert+"Errore nell\'aggiornamento del workerId.\n Riprova pi\ù tardi.";
        }else{
          alert=alert+"Id del turco aggiornato.";
        }
        window.alert(alert);
        back();
      });
    }else{
      if(alert!=""){
        window.alert(alert);
        back();
      }else{
        window.alert("Nessuna impostazione modificata!");
      }
    }
}

/**
 * Function called when the user click on the back button
 */
function back() {
    var impostazioniUrl = serverLocation + "bus-visualization.html";
    document.location.href = impostazioniUrl;
}
