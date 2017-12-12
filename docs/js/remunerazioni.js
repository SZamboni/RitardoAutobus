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

    var url=nodeLocation+"hits/?userId="+leggiCookie("userId");
    fetch(url,{
      method:"get",
      headers: {
          'Content-Type': 'application/json'
      }
    }).then ((response) => {
        var data= response.json();
        return data;
    }).then ((data) =>{
      if(data.length==0){
        var rigaHit = document.createElement("div");
        rigaHit.setAttribute("style","display:table-row; width:auto; cursor:pointer;");
        var iTag=document.createElement("i");
        iTag.innerHTML="Non ci sono remunerazioni attive su questo account";
        rigaHit.appendChild(iTag);
        areaRemunerazioni.appendChild(rigaHit);
      }else{
        //creo i miei elementi
        var rigaIntestazione=document.createElement("div")
        var dataIntestazione=document.createElement("div");
        var valoreIntestazione=document.createElement("div");
        //stilizzo i miei elementi
        rigaIntestazione.setAttribute("style","display:table-row; width:auto; background-color:#FFFFD0;");
        dataIntestazione.setAttribute("style","float:left;display:table-column;width:200px;");
        valoreIntestazione.setAttribute("style","float:left;display:table-column;");
        //popolo l'intestazione
        dataIntestazione.innerHTML="Data remunerazione";
        valoreIntestazione.innerHTML="Valore remunerazione";
        //aggiungo gli elementi alla riga
        rigaIntestazione.appendChild(dataIntestazione);
        rigaIntestazione.appendChild(valoreIntestazione);
        areaRemunerazioni.appendChild(rigaIntestazione);
        for(i=0;i<data.length;i++){
          //creo i miei elementi
          var rigaHit=document.createElement("div")
          var dataRemun=document.createElement("div");
          var valoreRemun=document.createElement("div");
          //stilizzo gli elementi
          rigaHit.setAttribute("style","display:table-row; width:auto; cursor:pointer;");
          dataRemun.setAttribute("style","float:left;display:table-column;width:200px;");
          valoreRemun.setAttribute("style","float:left;display:table-column;");

          //console.log(data[i]);
          //rendo la riga cliccabile
          var href="https://workersandbox.mturk.com/mturk/preview?groupId="+data[i].HitTypeId;
          rigaHit.onmouseover=function(){
            this.style.background="#D3D3D3";
          };
          rigaHit.onmouseleave=function(){
            this.style.background="#FFF";
          };

          rigaHit.utentiHitId=data[i].UtentiHitId;
          rigaHit.onclick=function(){
            var body={
              "utentiHitId" : this.utentiHitId
            };
            //avviso il backend che ho visualizzato la riga.
            fetch(nodeLocation+"hits/visual/",{
              method: "post",
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            }).then(function(){
                document.location.href=href;
            });
          };
          //popolo la riga
          dataRemun.innerHTML = data[i].DataHit.substr(0,10);
          valoreRemun.innerHTML = data[i].ValoreHit+"\€";
          //se non ho visualizzato un determinato dato lo setto come bold
          if(data[i].Visualizzato.data[0]==0){
            rigaHit.style.fontWeight="bold";
          }
          //se ho elaborato un determinato dato lo setto come italics
          if(data[i].Elaborato.data[0]!=0){
            rigaHit.style.fontStyle="italic";
          }
          //aggiungo gli elementi alla riga
          rigaHit.appendChild(dataRemun);
          rigaHit.appendChild(valoreRemun);
          areaRemunerazioni.appendChild(rigaHit);
        }
      }
    });
}

/**
 * Function called when the user click on the back button
 */
function back() {
    document.location.href = serverLocation;
}
