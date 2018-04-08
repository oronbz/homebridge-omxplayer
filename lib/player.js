var omx = require('node-omxplayer');
var process = require('process');

function Player(source, loop, volume, output, log) {
    // node 'spawn' doesn't support '~' so we replace it with home folder
    this.source = source.replace('~', process.env.HOME);
    this.quited = false;
    this.output = output;
    this.loop = loop;
    this.log = log;
    this.volume = (100-volume)*(-60) // converting percentage to millibels
    this.omx = omx(this.source, this.output, this.loop, this.volume);
    this.oldVolume = null;
    this.newVolume = null;
}

Player.prototype.quit = function() {
    this.quited = true;
    if (this.omx.running) {
        this.log('Closing player.');
        this.omx.quit();
    } else {
        this.log('Player is already off. Doing nothing...');
    }
}

Player.prototype.pause = function() {
    this.quited = true;
    if (this.omx.running) {
        this.log('Pausing player.');
        this.omx.pause();
    } else {
        this.log('Player is off. Doing nothing...');
    }
}

Player.prototype.play = function() {
    this.quited = true;
    if (this.omx.running) {
        this.log('Playing player.');
        this.omx.play();
    } else {
        this.log('Player is off. Doing nothing...');
    }
}

Player.prototype.newSource = function(source, loop, volume, output, log) {
    this.quited = false;
    // node 'spawn' doesn't support '~' so we replace it with home folder
    this.source = source.replace('~', process.env.HOME);
    this.output = output;
    this.loop = loop;
    this.log = log;
    this.volume = (100-volume)*(-60) // converting percentage to millibels
    this.omx.newSource(this.source, this.output, this.loop, this.volume);
}

Player.prototype.setVolume = function(newState, oldState) {
    var self = this;
    this.newVolume = newState
    if (this.oldVolume == null){
        this.oldVolume = oldState
        setTimeout(function(){
            self.log('Setting Volume to ' + self.newVolume);
            if (self.oldVolume > self.newVolume){
                var downTimes = (self.oldVolume - self.newVolume)/5
                var downTimeOut = function(){
                    setTimeout(function(){
                        if (downTimes > 0){
                            downTimes--;
                            self.omx.volDown()
                            downTimeOut();
                        }
                    }, 100)
                }
                downTimeOut();
            } else if (self.oldVolume < self.newVolume){
                var upTimes = (self.newVolume - self.oldVolume)/5
                var upTimeOut = function(){
                    setTimeout(function(){
                        if (upTimes > 0){
                            upTimes--;
                            self.omx.volUp()
                            upTimeOut();
                        }
                    },  100)
                }
                upTimeOut();
            }
            self.oldVolume = null
        }, 1500)
    }

    
}

Player.prototype.waitForClose = function(callback) {
    var self = this
    this.omx.on('close', function(){
        if (!self.quited) callback()
    })
}


module.exports = Player;
