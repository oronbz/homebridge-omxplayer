var Player = require('./lib/player');
var downloader = require('./lib/downloader');
var Service, Characteristic;

module.exports = function(homebridge) {
    
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    
    homebridge.registerAccessory('homebridge-omxplayer', 'OmxPlayer', OmxPlayer);
}

function OmxPlayer(log, config) {
    console.log('OmxPlayer plugin started!');
    this.log = log;
    this.name = config.name;
    this.filename = config.filename;
    this.youtube = config.youtube;
    this.player = null;
    
    this._service = new Service.Switch(this.name);
    this._service.getCharacteristic(Characteristic.On)
        .on('set', this._setOn.bind(this));
}

OmxPlayer.prototype.getServices = function() {
    return [this._service];
}

OmxPlayer.prototype._setOn = function(on, callback) {
    
    this.log('Setting omxplayer switch to ' + on);
    
    if (on) {
        if (this.youtube) {
            this.log('Youtube url found in config, downloading...');
            var self = this;
            downloader.download(this.youtube, this.log, function (err, filename) {
                self.log('Playing downloaded file.');
                self.player = new Player(filename, 'both', true);
                callback();            
            });
        } else if (this.filename) {
            this.log('Filename found, playing video.');
            this.player = new Player(this.filename, 'both', true);
            callback();
        }
    } else {
        this.log('Stopping player.');
        this.player.quit();
        callback();
    }
    
}
