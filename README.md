
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

## Troubleshooting

### Permissions issue
If you're running `homebridge` on a different user than `pi` you may have permission issues. Try running the following commands:

`sudo usermod -a -G video $(whoami)`

`sudo chmod 777 /usr/lib/node_modules/homebridge-omxplayer/node_modules/youtube-dl/bin/youtube-dl`

Delete any `.mp4` files inside your `/tmp` folder.

Make sure your `home` folder exists at `/home/USERNAME` and run `sudo chmod -R 0777 /home/USERNAME`

Reboot and try again.
 
## Credits
This plugin was inspired by homebridge-dummy by **@nfarina** and the idea for this plugin came from my little brother **@nitaybz** which has written many other plugins already, so you should definitely explore his repos too: https://github.com/nitaybz?tab=repositories