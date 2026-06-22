fx_version 'cerulean'
game 'gta5'

author 'lscripts'
description 'Loading screen for ESX Legacy'
version '1.2.2'
lua54 'yes'

loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'
loadscreen_cursor 'yes'

client_script 'client/client.lua'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/config.lua',
    'server/server.lua',
}

files {
    'html/index.html',
    'html/style.css',
    'html/settings.json',
    'html/patchnotes.json',
    'html/tips.json',
    'html/locales/*.json',
    'html/media/**/*',
}
