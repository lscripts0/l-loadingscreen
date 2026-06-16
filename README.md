# l-loadingscreen

Custom loading screen for ESX Legacy. Shows the connecting player's characters
(name, job, money, playtime, last seen, birthday) over a background with optional
music, plus Team, Patchnotes and Rules panels.

## Requirements

- [oxmysql](https://github.com/overextended/oxmysql)

## Install

1. Add the folder to your resources and put `ensure l-loadingscreen` in server.cfg.
2. Configure everything in `html/settings.json` (texts, background, audio, panels).
   Set `locale` to `en` or `de`.

The UI ships prebuilt, so there is no build step.

## Background video

A video is not included. To use one, add your own `bg.mp4` to `html/media/` and set
`background.type` to `video` in `html/settings.json`. Without a video it uses the
images in `html/media/`.

## Version

On start the server checks GitHub and prints whether the resource is up to date.
