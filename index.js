var Player = require('./lib/player');
var downloader = require('./lib/downloader');
var async = require("async")
var Service, Characteristic;

module.exports = function(homebridge) {
    
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;
    homebridge.registerPlatform('homebridge-omxplayer', 'OmxPlayer', OmxPlayer);
}

function OmxPlayer(log, config) {
    console.log('OmxPlayer plugin started!');
    this.log = log;
    this.name = config.name;
    this.playPlaylistSwitch = config.playPlaylistSwitch || true;
    this.shuffleSwitch = config.shuffleSwitch || false;
    this.repeatAll = config.repeatAll || false;
    this.playNextSwitch = config.playNextSwitch || true;
    this.volumeControl = config.volumeControl || false;
    this.playlist = config.playlist || [];
    this.path = config.path || HomebridgeAPI.user.persistPath()
    this.playingShuffle = false;
    this.playingPlaylist = false;
    this.playingIndividual = false;
    this.player = null;
    this.volume = this.volumeControl ? 50 : 100;
    this.trackAccessories = []
    this.nextRequest = false;
}

OmxPlayer.prototype.accessories = function(callback) {
    var myAccessories = []
    for (i=0;i<this.playlist.length;i++){
        var track = {
            name: this.playlist[i].switchName,
            youtube: this.playlist[i].youtube,
            filename: this.playlist[i].filename,
            loop: this.playlist[i].loop || true
        }
        var accessory = new trackAccessory(this.log, track, this);
        myAccessories.push(accessory);
        this.trackAccessories.push(accessory);
        this.log('Created New Track Accessory: "' + track.name + '"');
    }

    if (this.playPlaylistSwitch) {
        var accessory = new playPlaylistAccessory(this.log, this);
        myAccessories.push(accessory);
        this.playPlaylistAccessory = accessory;
        this.log('Created New Play Playlist Accessory: "Play ' + this.name + '"');
    }

    if (this.shuffleSwitch) {
        var accessory = new shuffleAccessory(this.log, this);
        myAccessories.push(accessory);
        this.shuffleAccessory = accessory;
        this.log('Created New Shuffle Accessory: "Shuffle ' + this.name + '"');
    }

    if (this.playNextSwitch) {
        var accessory = new playNextAccessory(this.log, this);
        myAccessories.push(accessory);
        this.log('Created New Play Next Accessory: "PlayNext ' + this.name + '"');
    }

    if (this.volumeControl) {
        var accessory = new volumeAccessory(this.log, this);
        myAccessories.push(accessory);
        this.log('Created New Volume Control Accessory: "Volume ' + this.name + '"');
    }
    callback(myAccessories);
}


function trackAccessory(log, config, platform) {
    this.log = log;
    this.name = config.name;
    this.youtube = config.youtube;
    this.filename = config.filename;
    this.loop = config.loop;
    this.path = platform.path
    this.platform = platform

    if (this.youtube) {   
        this.log('Youtube url found in config, downloading...');
        var self = this;
        downloader.download(this.youtube, this.path, this.log, function (err, filename) {
            self.filename = filename;
            self.log('Finished Download: ' + filename);
        });
    }

}

trackAccessory.prototype = {
    getServices: function(){
        this._service = new Service.Switch(this.name);
        this._service.getCharacteristic(Characteristic.On)
            .on('set', this.setOn.bind(this));

        var informationService = new Service.AccessoryInformation();
            informationService
                .setCharacteristic(Characteristic.Manufacturer, 'OMX Player')
                .setCharacteristic(Characteristic.Model, "track-"+this.name)
            
        return [this._service, informationService];
    },
    
    setOn: function(on, callback){
        var self = this;
        if (on) {
            for (q=0;q<self.platform.trackAccessories.length;q++){
                if (this.platform.trackAccessories[q] !== this) self.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(false)
            }
            if (this.platform.shuffleSwitch) this.platform.shuffleAccessory._service.getCharacteristic(Characteristic.On).updateValue(false)
            if (this.platform.playingPlaylist) this.platform.playPlaylistAccessory._service.getCharacteristic(Characteristic.On).updateValue(false)

            if (this.platform.player){
                this.log('Switching Track to ' + this.filename );
                this.platform.player.newSource(this.filename, this.loop, this.platform.volume, this.log);

            } else {
                this.log('Playing ' + this.filename );
                this.platform.player = new Player(this.filename, this.loop, this.platform.volume, this.log);
            }
            callback();

            this.platform.player.waitForClose(function(){
                // self.log(self.name + ' Stopped!');
                self._service.getCharacteristic(Characteristic.On).updateValue(false)
            })

        } else {
            if (this.platform.shuffleSwitch) this.platform.shuffleAccessory._service.getCharacteristic(Characteristic.On).updateValue(false)
            if (this.platform.playingPlaylist) this.platform.playPlaylistAccessory._service.getCharacteristic(Characteristic.On).updateValue(false)
            if (this.platform.player) {
                this.platform.player.quit();
                this.platform.player = null;
            } else {
                this.log('Player is already closed');
            }
            callback();
        }
    }
}



function playPlaylistAccessory(log, platform) {
    this.log = log;
    this.name = "Play " + platform.name
    this.playlist = platform.trackAccessories;
    this.loop = false;
    this.repeatAll = platform.repeatAll;
    this.keepPlaying = this.repeatAll
    this.platform = platform;

}   


playPlaylistAccessory.prototype = {
    getServices: function(){
        this._service = new Service.Switch(this.name);
        this._service.getCharacteristic(Characteristic.On)
            .on('set', this.setOn.bind(this));

        var informationService = new Service.AccessoryInformation();
            informationService
                .setCharacteristic(Characteristic.Manufacturer, 'OMX Player')
                .setCharacteristic(Characteristic.Model, "Play Playlist-"+this.platform.name)
            
        return [this._service, informationService];
    },
    
    setOn: function(on, callback){
        var self = this;
        var nextInterval
        if (on) {
            this.keepPlaying = this.repeatAll
            callback();
            if (this.platform.shuffleSwitch) this.platform.shuffleAccessory._service.getCharacteristic(Characteristic.On).updateValue(false)
            self.log('Playing Playlist - ' + this.platform.name);
            
            function playIt(){
                async.eachOfSeries(self.playlist, function (track, index, next) {
                    for (q=0;q<self.platform.trackAccessories.length;q++){
                        if (self.platform.trackAccessories[q].name == track.name) self.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(true)
                        else self.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(false)
                    }
                    if (self.platform.player !== null){
                        self.log('Playing ' + track.name );
                        self.platform.player.newSource(track.filename, self.loop, self.platform.volume, self.log);
        
                    } else {
                        self.log('Playing ' + track.name );
                        self.platform.player = new Player(track.filename, self.loop, self.platform.volume, self.log);
                    }

                    var closed = false;
                    nextInterval = setInterval(function(){
                        if (self.platform.nextRequest){
                            clearInterval(nextInterval)
                            self.log("Playing next track...")
                            self.platform.nextRequest = false
                            next();
                        } else if (closed){
                            clearInterval(nextInterval)
                            self.log(self.playlist[index].name + ' Stopped!');
                            next();
                        }
                    },2000)

                    self.platform.player.waitForClose(function(){
                        closed = true;
                    })

                }, function (err) {
                    if (self.keepPlaying){
                        self.log('Playing Playlist Again...' );
                        playIt()
                    } else {
                        self.log('Playlist is over...');
                        self._service.getCharacteristic(Characteristic.On).updateValue(false)
                        return;
                    }
                });
            }
            playIt()

        } else {
            clearInterval(nextInterval)
            for (q=0;q<self.platform.trackAccessories.length;q++){
                this.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(false)
            }
            this.keepPlaying = false
            if (this.platform.player) {
                this.platform.player.quit();
                this.platform.player = null;
            } else {
                this.log('Player is already closed');
            }
            callback();
        }
    }
}


function shuffleAccessory(log, platform) {
    this.log = log;
    this.name = "Shuffle " + platform.name
    this.playlist = platform.trackAccessories;
    this.loop = false;
    this.repeatAll = platform.repeatAll;
    this.keepPlaying = this.repeatAll
    this.platform = platform

}   


shuffleAccessory.prototype = {
    getServices: function(){
        this._service = new Service.Switch(this.name);
        this._service.getCharacteristic(Characteristic.On)
            .on('set', this.setOn.bind(this));

        var informationService = new Service.AccessoryInformation();
            informationService
                .setCharacteristic(Characteristic.Manufacturer, 'OMX Player')
                .setCharacteristic(Characteristic.Model, "Play Shuffle-"+this.platform.name)
            
        return [this._service, informationService];
    },
    
    setOn: function(on, callback){
        var self = this;
        var nextShuffleInterval;
        if (on) {
            this.keepPlaying = this.repeatAll
            callback();
            if (this.platform.playingPlaylist) this.platform.playPlaylistAccessory._service.getCharacteristic(Characteristic.On).updateValue(false);
            self.log('Playing Playlist Shuffled - ' + this.platform.name);

            function shuffle(a) {
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            }
            var shuffledPlaylist = []
            for (t=0;t<this.playlist.length;t++){
                shuffledPlaylist.push(this.playlist[t])
            }
            var shuffledPlaylist = shuffle(shuffledPlaylist)
            
            function playItShuffled(){
                async.eachOfSeries(shuffledPlaylist, function (track, index, next) {

                    for (q=0;q<self.platform.trackAccessories.length;q++){
                        if (self.platform.trackAccessories[q].name == track.name) self.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(true)
                        else self.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(false)
                    }
                    if (self.platform.player !== null){
                        self.log('Playing ' + track.name );
                        self.platform.player.newSource(track.filename, self.loop, self.platform.volume, self.log);
        
                    } else {
                        self.log('Playing ' + track.name );
                        self.platform.player = new Player(track.filename, self.loop, self.platform.volume, self.log);
                    }
                    
                    var closed = false;
                    nextShuffleInterval = setInterval(function(){
                        if (self.platform.nextRequest){
                            clearInterval(nextShuffleInterval)
                            self.log("Playing next track...")
                            self.platform.nextRequest = false
                            next();
                        } else if (closed){
                            clearInterval(nextShuffleInterval)
                            self.log(track.name + ' Stopped!');
                            next();
                        }
                    },2000)

                    self.platform.player.waitForClose(function(){
                        closed = true;
                    })


                }, function (err) {
                    if (self.keepPlaying){
                        self.log('Playing Playlist Shuffled Again...' );
                        playItShuffled()
                    } else {
                        self.log('Playlist is over...');
                        self._service.getCharacteristic(Characteristic.On).updateValue(false)
                        return;
                    }
                });
            }
            playItShuffled()

        } else {
            clearInterval(nextShuffleInterval)
            for (q=0;q<self.platform.trackAccessories.length;q++){
                this.platform.trackAccessories[q]._service.getCharacteristic(Characteristic.On).updateValue(false)
            }
            this.keepPlaying = false
            if (this.platform.player) {
                this.platform.player.quit();
                this.platform.player = null;
            } else {
                this.log('Player is already closed');
            }
            callback();
        }
    }
}



function playNextAccessory(log, platform) {
    this.log = log;
    this.name = "Play Next " + platform.name;
    this.platform = platform;

}   


playNextAccessory.prototype = {
    getServices: function(){
        this._service = new Service.Switch(this.name);
        this._service.getCharacteristic(Characteristic.On)
            .on('set', this.setOn.bind(this));

        var informationService = new Service.AccessoryInformation();
            informationService
                .setCharacteristic(Characteristic.Manufacturer, 'OMX Player')
                .setCharacteristic(Characteristic.Model, "Play Next-"+this.platform.name)
            
        return [this._service, informationService];
    },
    
    setOn: function(on, callback){
        var self = this;
        if (on) {
            console.log("Next Song Requested")
            this.platform.nextRequest = true;
            callback();
            setTimeout(function(){
                self._service.getCharacteristic(Characteristic.On).updateValue(false)
                self.platform.nextRequest = false;
            }, 3000)
        }
    }
}



function volumeAccessory(log, platform) {
    this.log = log;
    this.name = "Volume " + platform.name;
    this.volumeBeforeMute = 100;
    this.platform = platform
}

volumeAccessory.prototype = {
    getServices: function(){
        this._service = new Service.Lightbulb(this.name);
        this._service
            .getCharacteristic(Characteristic.On)
            .on('get', this.getMuteState.bind(this))
            .on('set', this.setMuteState.bind(this));
        
        this._service
            .addCharacteristic(new Characteristic.Brightness())
            .on('get', this.getVolume.bind(this))
            .on('set', this.setVolume.bind(this));

        var informationService = new Service.AccessoryInformation();
            informationService
                .setCharacteristic(Characteristic.Manufacturer, 'OMX Player')
                .setCharacteristic(Characteristic.Model, this.name)
            
        return [this._service, informationService];
    },
    
    getMuteState: function(callback){
        this.log("this.platform mute: "  +this.platform.volume)
        if (this.platform.volume == 0) callback(null, false)
        else  callback(null, true)
    },

    setMuteState: function(on, callback){
        if (on) {
            this.log('Disable Mute on Player...');
            if (this.platform.player) this.platform.player.setVolume(this.volumeBeforeMute, this.platform.volume);
            else this.log('Nothing is playing, But setting anyway');
            this.platform.volume = this.volumeBeforeMute
        } else {
            this.log('Setting Player to Mute...');
            if (this.platform.player) this.platform.player.setVolume(0, this.platform.volume);
            else this.log('Nothing is playing, But setting anyway');
            this.platform.volume = 0
        }
        callback();
    },

    getVolume: function(callback){
        this.log("this.platform.volume: "  + this.platform.volume)
        callback(null, this.platform.volume)
    },

    setVolume: function(state, callback){
        if (this.platform.player) this.platform.player.setVolume(state, this.platform.volume);
        else this.log('Nothing is playing, But setting anyway');
        this.platform.volume = state 
        if (state !== 0) this.volumeBeforeMute = state 
        callback();
    }
}