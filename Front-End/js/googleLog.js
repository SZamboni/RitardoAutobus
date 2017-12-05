/**
 * Function that is callen on a successful Google Login
 */
var logInWindow;
function openLogin(){
          logInWindow = window.open(serverLocation +"/login.html", "login", "width=200,height=100");
}
function closeWin() {
    logInWindow.close();   // Closes the new window
}

function onSignIn(googleUser) {

    var serverLocation = "http://localhost:8080";  // variable that store the location of the server

    var profile = googleUser.getBasicProfile();   // get the profile that has signed in

    // The ID token you need to pass to your backend:
    var id_token = "" + googleUser.getAuthResponse().id_token;

    // set the cookie to the user
    document.cookie = "token=" + id_token + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = "linkFoto=" +profile.getImageUrl();
    document.cookie = "email=" +profile.getEmail();

    // information that will be sendt to the server
    var informations = {
        'email': profile.getEmail(),
        'nome': profile.getGivenName(),
        'cognome': profile.getFamilyName(),
        'linkFoto': profile.getImageUrl()
    }
    console.log("Information that will be sent:\n " + JSON.stringify(informations));

    // sending the information using a XMLHTTPRequest
    var url = serverLocation + "/login/";

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
                //  Redirect the user to the new page
                var data = response.json();
                return data;
              }).then(function(data){
                console.log(data);
                document.cookie = "userId=" + data.id;
                window.opener.location.reload();
                window.opener.closeWin();
              });
}
;

function signOut() {
    delete_cookie("token");
    delete_cookie("linkFoto");
    delete_cookie("email");
    delete_cookie("userId");

    console.log(leggiCookie("userId"));

    var newUrl = serverLocation;
    window.location.reload();
}

var delete_cookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
