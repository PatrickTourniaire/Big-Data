firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("Logged in!");

    $('#name').text(user.displayName);
    $('#email').text(user.email);

    $(".profile-image").attr("src", user.photoURL);
    $(".modal-background").css("display", "none");
  } else {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page != "login.html") {
      window.location.replace("login.html");
    }
  }
});
