# l-loadingscreen

Custom loading screen for **ESX Legacy**. While the game loads it shows the connecting
player's own characters (name, job, money, playtime, last seen, birthday) over a
configurable video/image background with optional music, plus Team, Patchnotes and Rules
panels, a Message of the Day, rotating tips, live player count and social links.

Everything is configured in plain JSON, no build step. English and German are included.

## Requirements

- **ESX Legacy** (the resource reads the ESX `users`, `jobs` and `job_grades` tables to
  build the character list). It will not work on other frameworks without changing the
  server query.
- [oxmysql](https://github.com/overextended/oxmysql)

## Install

1. Add the folder to your resources and put `ensure l-loadingscreen` in your server.cfg.
2. Remove or stop any other loading screen (for ESX that is usually `esx_loadingscreen`),
   you can only run one at a time.
3. Configure everything in `html/settings.json` (server name, background, audio, panels).
   Set `locale` to `en` or `de`.

The UI ships prebuilt, so there is no build step.

## Configuration

All settings live in `html/settings.json` (each option is documented inline). Content for
the panels has its own files so you can edit them without touching the main config:

- `html/settings.json` server name, background, audio, character fields, team, rules, motd, social
- `html/patchnotes.json` patchnotes releases
- `html/tips.json` rotating tips
- `html/locales/en.json` / `de.json` the built-in UI texts
- `html/style.css` accent colour and background dim (`--bg-dim`)
- `html/media/` drop your `bg.mp4`, background images, music and team images here

## Background video

A video is not included. To use one, add your own `bg.mp4` to `html/media/` and set
`background.type` to `video` in `html/settings.json`. Without a video set the type to
`image` to use the images in `html/media/`.

## Version

On start the server checks GitHub and prints to the console whether the resource is up to
date.

## Support

If you find this resource useful, you can support development on Ko-fi:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/lscripts)
