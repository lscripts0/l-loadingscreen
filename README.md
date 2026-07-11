# l-fivem-loadingscreen

Custom loading screen for **ESX Legacy and QBCore**. While the game loads it shows the
connecting player's own characters (name, job, money, playtime, last seen, birthday) over a
configurable video/image background with optional music, plus Team, Patchnotes and Rules
panels, a Message of the Day, rotating tips, live player count and social links.

Everything is configured in plain JSON, no build step. English and German are included.

## Requirements

- **ESX Legacy** or **QBCore** (incl. Qbox). The framework is detected automatically; on
  ESX the character list is read from the `users`, `jobs` and `job_grades` tables, on
  QBCore from the `players` table. You can force it in `server/config.lua`
  (`Config.Framework`).
- [oxmysql](https://github.com/overextended/oxmysql)

## Install

1. Add the folder to your resources and put `ensure l-fivem-loadingscreen` in your server.cfg.
2. Remove or stop any other loading screen (usually `esx_loadingscreen` on ESX or
   `qb-loading` on QBCore), you can only run one at a time.
3. Configure everything in `html/settings.json` (server name, background, audio, panels).
   Set the language in `server/config.lua` (`Config.Locale`, `en` or `de`).

The UI ships prebuilt, so there is no build step.

## Configuration

All settings live in `html/settings.json` (each option is documented inline). Content for
the panels has its own files so you can edit them without touching the main config:

- `html/settings.json` server name, background, audio, character fields, team, rules, motd, social
- `html/patchnotes.json` patchnotes releases
- `html/tips.json` rotating tips
- `locales/en.lua` / `de.lua` the built-in UI texts
- `html/style.css` accent colour and background dim (`--bg-dim`)
- `html/media/` drop your `bg.mp4`, background images, music and team images here
- `server/config.lua` framework, language, connect rate limit and Discord join/leave webhooks

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
