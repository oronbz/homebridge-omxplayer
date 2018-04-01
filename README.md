
# homebridge-omxplayer
A Raspberry Pi (only) Plugin to download and play any YouTube video or a local video file using `omxplayer`.

_________________________________________
#### Creating and maintaining Homebridge plugins consume a lot of time and effort, if you would like to share your appreciation, feel free to "Star" or donate. 

<a target="blank" href="https://www.paypal.me/nitaybz"><img src="https://img.shields.io/badge/Donate-PayPal-blue.svg"/></a>
<a target="blank" href="https://blockchain.info/payment_request?address=18uuUZ5GaMFoRH5TrQFJATQgqrpXCtqZRQ"><img src="https://img.shields.io/badge/Donate-Bitcoin-green.svg"/></a>

[Click here](https://github.com/nitaybz?utf8=%E2%9C%93&tab=repositories&q=homebridge) to review more of my plugins.
_________________________________________

#### New version (2.0)  - This plugin is a platform now and have many new features:

**Play Playlist** - to play the tracks in their order.

**Play Playlist Shuffle** - to play tracks in a random order.

**Play Next Switch** - to play the next song in the list.

**Repeat All** - set to true to allow the playlist to repeat itsef when it**s done.

**Volume Control** Light Bulb - to control the volume of the track, when set to false 100% volume will be used.

**Format** in config - for choosing the quality of the downloaded file. USE WITH CAUTION - See "Formats" section below.

**Path** in config - to choose which folder to download the files. when not set, the default persist folder will be chosen.

**Output** in config - to select your audio output ("both, "hdmi", "local", "alsa"), default to "both.

## Example config.json:

 ```
"platforms": [
    {
        "platform": "OmxPlayer",
        "name": "Baby Playlist",
        "playPlaylistSwitch": true,
        "shuffleSwitch": true,
        "repeatAll": true,
        "format": "18",
        "path": "remove this row to download to default persist folder",
        "output": "both",
        "playNextSwitch": true,
        "volumeControl": true,
        "playlist": [
            {
                "switchName": "Coldplay Babies Go",
                "youtube": "https://www.youtube.com/watch?v=t7G-hU5Eaxc",
                "loop": false
            },
            {
                "switchName": "Beatles Babies Go",
                "youtube": "https://youtu.be/cF4jiDsifmo",
                "loop": false
            },
            {
                "switchName": "testFile",
                "filename": "my_video.mp4"
            },
            {
                "switchName": "Lullaby",
                "youtube": "https://www.youtube.com/watch?v=TAGP3LwyP0M",
                "loop": true
            },
            {
                "switchName": "Lullaby2",
                "youtube": "https://www.youtube.com/watch?v=Bhh9OQKh-Sc"
            },
            {
                "switchName": "Lullaby3",
                "youtube": "https://www.youtube.com/watch?v=Bhh9OQKh-Sc"
            }
        ]
    }
]

```

## Why do we need this plugin?

This plugin is great for getting some music and videos into scenes and automations, for example:
- It can be used for a "Good Night" scene with a lullaby music for babies (can be done with speakers only connected to Pi).
- It can play music videos on TV screen (connected to the Raspberry Pi) when "Arrive Home" is triggered.
- it can be connected to a projector and project any video (I used it for the kids room).

## How it works

Basically, all you need to do is:
1. Set the desired youtube url or local filename.
2. Use this switch in any scene or automation.

when setting a new youtube link, only for the first time,the video will be downloaded which should take a few seconds.

## How to install
 ```sudo apt-get install omxplayer```

 ```sudo npm install -g homebridge-omxplayer```

The raspberry pi should be logged in with the same user that runs homebridge.
It is suggested to use auto-login when Raspberry rebooted.

## Troubleshooting

### Permissions issue
If you're running `homebridge` on a different user than `pi` you may have permission issues. Try running the following commands:

`sudo usermod -a -G video $(whoami)`

`sudo chmod 777 /usr/lib/node_modules/homebridge-omxplayer/node_modules/youtube-dl/bin/youtube-dl`

Delete any `.mp4` files inside your `/tmp` folder.

Make sure your `home` folder exists at `/home/USERNAME` and run `sudo chmod -R 0777 /home/USERNAME`

Reboot and try again.




## Formats

### Easy Formats
**"best"**: Select the best quality format represented by a single file with video and audio.

**"worst"**: Select the worst quality format represented by a single file with video and audio.

**"bestvideo"**: Select the best quality video-only format (e.g. DASH video). May not be available.

**"worstvideo"**: Select the worst quality video-only format. May not be available.

**"bestaudio"**: Select the best quality audio only-format. May not be available.

**"worstaudio"**: Select the worst quality audio only-format. May not be available



### For Experts 
#### it will only download if this version is available for all your tracks

|  format code |  extension | resolution |  note  |
| ------------ | ---------- | ------------ | ------ |
| 140          |     m4a    |   audio only |  DASH audio , audio@128k (worst)|
| 160          |     mp4    |   144p       |  DASH video , video only|
| 133          |     mp4    |   240p       |  DASH video , video only| 
| 134          |     mp4    |   360p       |  DASH video , video only| 
| 135          |     mp4    |   480p       |  DASH video , video only| 
| 136          |     mp4    |   720p       |  DASH video , video only| 
| 17           |     3gp    |   176x144    |  | 
| 36           |     3gp    |   320x240    |  | 
| 5            |     flv    |   400x240    |  | 
| 43           |     webm   |   640x360    |  | 
| 18           |     mp4    |   640x360    |  | 
| 22           |     mp4    |   1280x720   |  (best)| 

 
## Credits
This plugin was inspired by homebridge-dummy by **@nfarina** and the idea for this plugin came from my little brother **@nitaybz** which has written many other plugins already, so you should definitely explore his repos too: https://github.com/nitaybz?tab=repositories
