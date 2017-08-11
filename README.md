
# "OmxPlayer" Plugin

## Example config.json:

 ```
    "accessories": [
        {
          "accessory": "OmxPlayer",
          "name": "OmxPlayer",

          "youtube": "https://www.youtube.com/watch?v=lf_wVfwpfp8"
          --OR--
          "filename": "my_video.mp4"
        }   
    ]

```

## Why do we need this plugin?

With this plugin you can download and play any YouTube video or a local video file using `omxplayer`.

## How it works

Basically, all you need to do is:
1. Set the desired youtube url or local filename.
2. Use this switch in any scene or automation.

## How to install
 ```sudo apt-get install omxplayer```

 ```sudo npm install -g homebridge-omxplayer```
 
## Credits
This plugin was inspired by homebridge-dummy by **@nfarina** and the idea for this plugin came from my little brother **@nitaybz** which has written many other plugins already, so you should definitely explore his repos too: https://github.com/nitaybz?tab=repositories