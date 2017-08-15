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
        if (this.player) {
            this.log('Player is already on. Doing nothing...');
            callback();
            return;
        }
        if (this.youtube) {   
            this.log('Youtube url found in config, downloading...');
            var self = this;
            downloader.download(this.youtube, this.log, function (err, filename) {
                if (self.player) {
                    self.log('Player is already on. Doing nothing...');
                } else {
                    self.log('Playing downloaded file.');
                    self.player = new Player(filename, 'both', true);
                }
                callback();
            });
        } else if (this.filename) {
            this.log('Filename found, playing video.');
            this.player = new Player(this.filename, 'both', true, this.log);
            callback();
        }
    } else {
        if (this.player) {
            this.player.quit();
        } else {
            this.log('Couldn\'t stop player, please close it manually.');
        }
        callback();
    }
    
}
