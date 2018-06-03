function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    console.log(ext);
    switch (ext.toLowerCase()) {
        case 'jpg':
            return true;
            break;
        case 'gif':
            return true;
            break;
        case 'bmp':
            return true;
            break;
        case 'png':
            return true;
            break;
        default:
            return false;
            break;
    }
}

function isVideo(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
        case 'm4v':
            return true;
            break;
        case 'avi':
            return true;
            break;
        case 'mpg':
            return true;
            break;
        case 'mp4':
            return true;
            break;
        default:
            return false;
            break;
    }
}
