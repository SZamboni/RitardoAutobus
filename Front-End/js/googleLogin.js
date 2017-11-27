function onSignIn(googleUser) {

    var serverLocation = "http://localhost:8080";  // variable that store the location of the server

    var profile = googleUser.getBasicProfile();   // get the profile that has signed in

    /*
     // display the information about the user
     console.log("ID: " + profile.getId());
     console.log('Full Name: ' + profile.getName());
     console.log('Given Name: ' + profile.getGivenName());
     console.log('Family Name: ' + profile.getFamilyName());
     console.log("Image URL: " + profile.getImageUrl());
     console.log("Email: " + profile.getEmail());
     */
    // The ID token you need to pass to your backend:
    var id_token = "" + googleUser.getAuthResponse().id_token;
    //  console.log("ID Token: " + id_token);

    // set the cookie to the user
    document.cookie = "email=" + profile.getEmail();
    document.cookie = "token=" + id_token + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";

    // information that will be sendt to the server
    var informations = {
        'email': profile.getEmail(),
        'nome': profile.getGivenName(),
        'cognome': profile.getFamilyName(),
        'linkFoto': profile.getImageUrl()
    };
    console.log("Information that will be sent:\n " + JSON.stringify(informations));

    // sending the information using a XMLHTTPRequest
    var url = serverLocation + "/postlogin";

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
                var newUrl = serverLocation + "/bus-visualization.html";
                document.location.href = newUrl;
            });

}

// the sign out button
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}
