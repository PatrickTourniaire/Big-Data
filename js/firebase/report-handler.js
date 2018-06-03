
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var dbRef = firebase.database().ref("files_done/" + user.uid)

      dbRef.on('child_added', function(data) {
        parsedDate = formatDate(data.val().date);
        var name = data.val().name.substring(0, 10) + '...' +  data.val().name.substring(data.val().name.length - 3, data.val().name.length);
        var data = {
          key: data.key,
          name: name,
          date: parsedDate,
          results: data.val().results
        }

        addReport(data.key, data);
      });

      // On removed listner
      dbRef.on('child_removed', function(snap) {
        removeItem(snap.key);
      });
    }
});


function addReport(key, data) {
  var template = $('#report-template').html();
  var card = Mustache.render(template, data);

  $('.analysis-reports').append(card)

  for (var key in data.results) {
    var probability = parseFloat(data.results[key].substring(0, 4)) * 10;
    var type = key.split(":")[1];
    var index = key.split(":")[0];
    var def = "medium"
    if (probability < 50) {
      def = "low"
    } else if (probability < 70) {
      def = "medium"
    } else {
      def = "high"
    }
    var item = `
      <div class="details-item">
        <p id="type">${index}</p>
        <p id="type">${type}</p>
        <p id="probability" class="${def}">${probability.toFixed(1)}%</p>
      </div>
    `

    $(".details").append(item);
  }


  var expand = $("." + data.key + " #extendReport");
  var details = $("." + data.key + " .details");
  expand.click(function() {
    console.log("clicked");
    if (details.css("display") == "none") {
      $("." + data.key + " .extendReport").css("transform", "rotate(180deg)");
      details.css("display", "block");
    } else {
      $("." + data.key + " .extendReport").css("transform", "rotate(0deg)");
      details.css("display", "none");
    }
    $(".details").toggle(display);
  })

  var remove = $("." + data.key + " #removeImgFile");
  remove.click(function() {
    firebase.database().ref("files_done/" + user.uid + "/" + data.key + "/name").once('value').then(function(snapshot) {
      name = snapshot.val();
      console.log(name);

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
      })
  })

  // Get the <span> element that closes the modal
  var span = $(".close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.css("display", "none");
  }
}

function removeItem(key) {
  $('.' + key).remove();
}
