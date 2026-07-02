fx_version 'cerulean'
game 'gta5'

author 'lscripts'
description 'Loading screen for ESX and QBCore'
version '1.3.0'
lua54 'yes'

loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'
loadscreen_cursor 'yes'

shared_scripts {
    'locales/en.lua',
    'locales/de.lua',
    'shared/locale.lua',
}

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
    'html/media/**/*',
}
