var omx = require('node-omxplayer');
var process = require('process');

function Player(source, loop, volume, log) {
    // node 'spawn' doesn't support '~' so we replace it with home folder
    this.source = source.replace('~', process.env.HOME);
    this.output = 'both';
    this.loop = loop;
    this.log = log;
    this.volume = (100-volume)*(-60) // converting percentage to millibels
    this.omx = omx(this.source, this.output, this.loop, this.volume);
}

Player.prototype.quit = function quit() {
    if (this.omx.running) {
        this.log('Closing player.');
        this.omx.quit();
    } else {
        this.log('Player is already off. Doing nothing...');
    }
}

Player.prototype.newSource = function(source, loop, volume, log) {
    // node 'spawn' doesn't support '~' so we replace it with home folder
    this.source = source.replace('~', process.env.HOME);
    this.output = 'both';
    this.loop = loop;
    this.log = log;
    this.volume = (100-volume)*(-60) // converting percentage to millibels
    this.omx.newSource(this.source, this.output, this.loop, this.volume);
}

Player.prototype.setVolume = function(newState, oldState) {
    if (oldState > newState){
        var downTimes = (oldState - newState)*60
        for (k=0;k<downTimes;k++){
            this.omx.volDown()
        }
    } else if (oldState < newState){
        var upTimes = (newState - oldState)*60
        for (k=0;k<upTimes;k++){
            this.omx.volUp()
        }
    }
}

Player.prototype.waitForClose = function(callback) {
    this.omx.on('close', function(){
        callback()
    })
}


module.exports = Player;