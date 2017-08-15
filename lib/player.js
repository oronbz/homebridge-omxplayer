var omx = require('node-omxplayer');
var process = require('process');

function Player(source, output, loop) {
    // node 'spawn' doesn't support '~' so we replace it with home folder
    this.source = source.replace('~', process.env.HOME);
    this.output = output;
    this.loop = loop;
    this.omx = omx(this.source, this.output, this.loop);
}

Player.prototype.quit = function quit() {
    if (this.omx.running) {
        this.omx.quit();
    }
}

module.exports = Player;