var exec = require("child_process").exec;
var kill = require("tree-kill");
var Service, Characteristic;

module.exports = function(homebridge) {
    
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    
    homebridge.registerAccessory("homebridge-omxplayer", "OmxPlayer", OmxPlayer);
}

function OmxPlayer(log, config) {
    console.log("OmxPlayer plugin started!");
    this.log = log;
    this.name = config.name;
    this.omxpid = 0;
    
    this._service = new Service.Switch(this.name);
    this._service.getCharacteristic(Characteristic.On)
        .on('set', this._setOn.bind(this));
}

OmxPlayer.prototype.getServices = function() {
    return [this._service];
}

OmxPlayer.prototype._setOn = function(on, callback) {
    
    this.log("Setting omxplayer switch to " + on);
    
    if (on) {
        this.log("playing the song");
        this.omxpid = exec("omxplayer ~/song.mp4").pid;
    } else {
        this.log("killing omx player");
        kill(this.omxpid);
    }
    callback();
}
