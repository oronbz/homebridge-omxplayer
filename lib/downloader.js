var fs = require('fs');
var youtubedl = require('youtube-dl');

function download(source, log, callback) {
    var filename = '/tmp/' + videoId(source) + '.mp4';
    if (fs.existsSync(filename)) {
        log('File: ' + filename + ' already exists skipping download.');
        callback(null, filename);
        return;
    }

    var video = youtubedl(source, ['--format=18'], { cwd: '/tmp/' });
    log('Starting to download from: ' + source + ' to: ' + filename + '.');

    video.on('end', function() {
        log('Download finished.');
        callback(null, filename);
    });

    video.pipe(fs.createWriteStream(filename));
}

function videoId(source) {
    var video_id = source.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
    }
    return video_id;
}

module.exports = {
    download: download
};