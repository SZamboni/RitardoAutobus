/**
 * Function that is callen on a successful Google Login
 */
var logInWindow;

function openLogin(){
    logInWindow = window.open(serverLocation +"/login.html", "login", "width=500,height=300");
}

function closeLoginWin() {
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
        
        if(data.primologin){
            show_turk();
        }
        else{
            window.opener.location.reload();
            window.opener.closeLoginWin();
        } 
    });
};

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

/**
 * Function that send the information about the id of the user to the server
 */
function action() {
    var input = document.getElementById("id_turk");
    console.log("ID: " + input.value);
    var information = {
        WorkerId : input.value
    }
    var url = serverLocation + "/worker";

    

    // fetch the url
    fetch(url, {
        method: "post", // this is a HTTP POST
        headers: {
            'Content-Type': 'application/json'    // the content is a JSON so we must set the Content-Type header
        },
        // body to send in the request, must convert in string before sending
        body: JSON.stringify(information)
    })
    .then((response) => { // function executed when the request is finisced
        // parse the response
        var data = response.json();
        return data;
    }).then(function(data){
        window.opener.location.reload();
        window.opener.closeLoginWin();

    });
}

/**
 * Function that hide the turk div
 */
function load_login() {
    console.log("load_login")
    var div_turk = document.getElementById("turk");
    //div_turk.style.display = 'none';
}

/**
 * Function that hide the login div
 */
function show_turk() {
    console.log("show_turk")
    var div_login = document.getElementById("login");
    div_login.style.display = 'none';

    var div_turk = document.getElementById("turk");
    div_turk.style.display = 'inline';
}