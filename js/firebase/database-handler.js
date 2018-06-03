
function fileDatabaseRef(fileName, typeRef, userId, downUrl) {
    var db = firebase.database().ref();
    var ref = db.child(typeRef + '/' + userId);
    var pushPool = db.child(typeRef + '/all_under_process')

    var postId = ref.push().key;
    var pushDetails = ref.child(postId).set({
        downUrl: downUrl,
        name: fileName,
        type: "Object Detection",
        date: String(new Date()),
        state: "ANALYSIS"
    }).then( function() {
        console.log("[SUCCESS] File backed up to database!");
    }).catch(function (error) {
        console.error("[ERROR] " + error);
    })

    pushPool.child(postId).set({
      id: postId,
      userId: userId
    }).then( function() {
        console.log("[SUCCESS] File backed up to database!");
    }).catch(function (error) {
        console.error("[ERROR] " + error);
    })

}

// Load files real-time to browser
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var dbAnalysisRef = firebase.database().ref("files_under_analysis/" + user.uid);

      dbAnalysisRef.on('child_added', function(data) {
        parsedDate = formatDate(data.val().date);
        var name = data.val().name.substring(0, 10) + '...' +  data.val().name.substring(data.val().name.length - 3, data.val().name.length);
        var data = {
          name: name,
          date: parsedDate,
          type: data.val().type,
          key: data.key,
          downUrl: data.val().downUrl
        }

        addFileAnalysis(data.key, data);
      });

      // On removed listner
      dbAnalysisRef.on('child_removed', function(snap) {
        removeFile("analysis-process-files", snap.key);
      });
    }
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var dbRef = firebase.database().ref("files_done/" + user.uid)

      dbRef.on('child_added', function(data) {
        parsedDate = formatDate(Date.parse(data.val().date));
        var name = data.val().name.substring(0, 10) + '...' +  data.val().name.substring(data.val().name.length - 3, data.val().name.length);
       
        var data = {
          name: name,
          date: parsedDate,
          type: data.val().type,
          key: data.key,
          downUrl: data.val().downUrl
        }

        addFile(data.key, data);
      });

      // On removed listner
      dbRef.on('child_removed', function(snap) {
        removeFile("analysis-files", snap.key);
      });
    }
});

function addFileAnalysis(key, data) {
    var template = $("#file-template").html();
    var card = Mustache.render(template, data);

    $(".analysis-process-files").append(card);

    $("#file-analyze-template").css("display", "block");

    user = firebase.auth().currentUser;

    // Get the modal
    var modal = $('#myModal');

    // Get the image and insert it inside the modal - use its "alt" text as a caption
    var img = $('.file .content');
    var modalImg = $("#img01");
    var captionText = $("#caption");

    img.click(function() {
      modal.css("display", "flex");
      modalImg.attr("src", data.downUrl);
      captionText.text(data.name);
    })

    var remove = $("." + data.key + " #removeImgFile");
    remove.click(function() {
      firebase.database().ref("files_under_analysis/" + user.uid + "/" + data.key + "/name").once('value').then(function(snapshot) {
        name = snapshot.val();
        var storageRef = firebase.storage().ref();

        $("#file-analyze-template").css("display", "none");

        storageRef.child("files_under_analysis/" + name).delete().then(function() {
          firebase.database().ref("files_under_analysis/" + user.uid + "/" + data.key).remove();
          firebase.database().ref("files_under_analysis/all_under_process/" + data.key).remove();

          var successData = {
            quick: "File deleted!",
            description: error
          }
          var template = $('#success-toast').html();
          var alert = Mustache.render(template, successData);

          $('body').append(card)
        }).catch(function(error) {
          if (error) {
            console.error("[ERROR] Could not delete file! Returned: " + error);

            var alertData = {
              quick: "Could not delete file!",
              description: "There was an error when deleting image from storage."
            }
            var template = $('#alert-toast').html();
            var alert = Mustache.render(template, alertData);

            $('body').append(card)
          }
        })
      });
    });

    // Get the <span> element that closes the modal
    var span = $(".close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.css("display", "none");
    }
}

function addFile(key, data) {
  var template = $('#file-template').html();
  var card = Mustache.render(template, data);

  $('.analysis-files').append(card)

  $("#file-analyze-template").css("display", "none");

  // Get the modal
  var modal = $('#myModal');

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var img = $('.' + data.key + ' .content');
  var modalImg = $("#img01");
  var captionText = $("#caption");

  img.click(function() {
    modal.css("display", "flex");
    modalImg.attr("src", data.downUrl);
    captionText.text(data.name);
  });

  var remove = $("." + data.key + " #removeImgFile");
  remove.click(function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        firebase.database().ref("files_done/" + user.uid + "/" + data.key + "/name").once('value').then(function(snapshot) {
          name = snapshot.val();
          console.log(name);
          var storageRef = firebase.storage().ref();

          firebase.database().ref("files_done/" + user.uid + "/" + data.key).remove();

          var successData = {
            quick: "File deleted!",
            description: error
          }
          var template = $('#success-toast').html();
          var alert = Mustache.render(template, successData);

          $('body').append(card)
        }).catch(function(error) {
            if (error) {
              console.error("[ERROR] Could not delete file! Returned: " + error);

              var alertData = {
                quick: "Could not delete file!",
                description: "There was an error when deleting image from storage."
              }
              var template = $('#alert-toast').html();
              var alert = Mustache.render(template, alertData);

              $('body').append(card)
            }
          });
      } else {
        console.warn("[WARN] User is not logged in!");
      }
    });
  });

  // Get the <span> element that closes the modal
  var span = $(".close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.css("display", "none");
  }
}

function removeFile(scope, key) {
  $('.' + scope + ' .' + key).remove();
}
