var Service, Characteristic

module.exports = function(homebridge) {
    
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    
    homebridge.registerAccessory("homebridge-omxplayer", "OmxPlayer", OmxPlayer)
}

function OmxPlayer(log, config) {
    this.log = log;
    this.name = config.name;
    
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
        this._service.setCharacteristic(Characteristic.On, false);
    } else {
        this.log("killing omx player");
        this._service.setCharacteristic(Characteristic.On, true);
    }
    callback();
}
