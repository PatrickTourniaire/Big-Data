
$("#login-google").click(function() {
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(function() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      var user = result.user;
      console.log(user)

      window.location.replace('index.html');
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      var email = error.email;
      var credential = error.credential;
    });
  })
  .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
  });
})

$(".logout-btn").click(function() {
  firebase.auth().signOut().then(function() {
    console.log("[INFO] Signed out!");
    window.location.replace('login.html');
  }, function(error) {
  })
})

$(".close-menu").click(function() {
  $("nav").css("visibility", "collapse");
})

$(".menu").click(function() {
  $("nav").css("visibility", "visible");
})