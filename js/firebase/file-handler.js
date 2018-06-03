
function uploadFilesToFirebase(file) {
        var storageRef = firebase.storage().ref();
        user = firebase.auth().currentUser;

        filename = file[0].name;
        console.log(filename);
        typeRef = "files_under_analysis";
        fileRef = storageRef.child(typeRef + '/' + filename);
        if (isImage(filename) && user) {
            var uploadTask = storageRef.child(typeRef + '/' + filename).put(file[0]);
            uploadTask.on('state_changed', function(snapshot){
                // TODO: Update progress bar
                $("#file-process-template").css("display", "block");

                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');

                if (progress == 100) {
                  $("#file-process-template").css("display", "none");
                }

                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        console.log('Upload is running');
                        break;
                }
            }, function(error) {
                console.error(error);
            }, function() {
                // Handle successful uploads on complete
                var downloadURL = uploadTask.snapshot.downloadURL;
                console.log("[SUCCESS] File uploaded to undergo analysis!");
                fileDatabaseRef(filename, typeRef, user.uid, downloadURL);
            });
        } else {
            console.log("[WARNING] Selected file(s) are not images!");
        }
}
