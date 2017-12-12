
 var serverLocation = "https://michelebonapace.github.io/RitardoAutobus/";
 var nodeLocation = "https://floating-eyrie-45682.herokuapp.com/";
/*
 var serverLocation = "http://localhost:8080/";
 var nodeLocation = "http://localhost:8080/";
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

function load(){
  var id = leggiCookie("userId");

  if(id == undefined) {
      console.log("User not logged in");
      document.location.href = serverLocation;
  } else {
      console.log("User logged in");
  }
}

function conferma(){
  var workerId = document.getElementById("workerId");

  var body={
    "userId" : leggiCookie("userId"),
    "workerId" : workerId.value
  };

  var url=nodeLocation+"worker/";
  fetch(url,{
    method: "post",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response)=>{
    var newUrl = serverLocation;
    document.location.href = newUrl;
  });
}
