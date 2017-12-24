var fs = require('fs');
var youtubedl = require('youtube-dl');

function download(source, path, format, log, callback) {
    var filename = path + "/" + videoId(source) + '.mp4';
    if (fs.existsSync(filename)) {
        log('File: ' + filename + ' already exists skipping download.');
        callback(null, filename);
        return;
    }

    var video = youtubedl(source, ['--format='+format], { cwd: path });
    log('Starting to download from: ' + source + ' to: ' + filename + '.');

    video.on('end', function() {
        callback(null, filename);
    });

    video.pipe(fs.createWriteStream(filename));
}

function videoId(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

module.exports = {
    download: download
};