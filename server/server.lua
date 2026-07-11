local START_TIME = os.time()

local VERSION_REPO = 'lscripts0/l-fivem-loadingscreen'
local REPO_URL = 'https://github.com/lscripts0/l-fivem-loadingscreen'

local charactersEnabled = true

local function loadCharactersEnabled()
    local raw = LoadResourceFile(GetCurrentResourceName(), 'html/settings.json')
    if not raw then return true end

    local ok, data = pcall(json.decode, raw)
    if not ok or type(data) ~= 'table' then return true end

    return not (data.characters and data.characters.enabled == false)
end

CreateThread(function()
    charactersEnabled = loadCharactersEnabled()
end)

local function checkVersion()
    local current = GetResourceMetadata(GetCurrentResourceName(), 'version', 0)
    current = current and current:match('%d+%.%d+%.%d+')
    if not current then return end

    PerformHttpRequest(('https://api.github.com/repos/%s/releases/latest'):format(VERSION_REPO), function(status, body)
        if status ~= 200 or not body then return end

        local ok, res = pcall(json.decode, body)
        if not ok or type(res) ~= 'table' or res.prerelease then return end

        local latest = res.tag_name and res.tag_name:match('%d+%.%d+%.%d+')
        if not latest then return end

        local cv, lv = {}, {}
        for n in current:gmatch('%d+') do cv[#cv + 1] = tonumber(n) end
        for n in latest:gmatch('%d+') do lv[#lv + 1] = tonumber(n) end

        local behind = false
        for i = 1, 3 do
            local c, l = cv[i] or 0, lv[i] or 0
            if c ~= l then
                behind = c < l
                break
            end
        end

        if behind then
            print(('^3%s^7'):format(_U('version.outdated', { current = current, latest = latest, url = REPO_URL .. '/releases/latest' })))
        else
            print(('^2%s^7'):format(_U('version.current', { current = current })))
        end
    end, 'GET', '', { ['User-Agent'] = 'l-fivem-loadingscreen' })
end

CreateThread(function()
    Wait(2000)
    checkVersion()
end)

local function getEndpointIp(src)
    local ep = GetPlayerEndpoint(src)
    if not ep then return nil end
    return (tostring(ep):gsub(':%d+$', ''))
end

local function webhookUrl(event)
    if not (Config.Webhook and Config.Webhook.enabled) then return nil end
    local url = Config.Webhook.events and Config.Webhook.events[event]
    if type(url) == 'string' and url ~= '' then return url end
    return nil
end

local function postWebhook(url, embed)
    if not url then return end

    PerformHttpRequest(url, function() end, 'POST', json.encode({
        username = Config.Webhook.username,
        embeds = { embed },
    }), { ['Content-Type'] = 'application/json' })
end

local function serverStats()
    return {
        players = #GetPlayers(),
        maxPlayers = GetConvarInt('sv_maxClients', 48),
        uptime = os.time() - START_TIME,
    }
end

local framework

local function isStarted(resource)
    local state = GetResourceState(resource)
    return state == 'started' or state == 'starting'
end

local function getFramework()
    if framework then return framework end

    if Config.Framework and Config.Framework ~= 'auto' then
        framework = Config.Framework
        return framework
    end

    if isStarted('es_extended') then
        framework = 'esx'
    elseif isStarted('qb-core') or isStarted('qbx_core') then
        framework = 'qb'
    else
        framework = 'esx'
    end

    return framework
end

local function decodeJson(raw)
    if type(raw) ~= 'string' then return nil end
    local ok, data = pcall(json.decode, raw)
    if ok and type(data) == 'table' then return data end
    return nil
end

local function queryCharactersEsx(license)
    local hex = license:gsub('license:', '')

    local rows = MySQL.query.await([[
        SELECT  u.identifier, u.firstname, u.lastname, u.job, u.job_grade,
                u.accounts, u.dateofbirth, u.sex, u.metadata,
                UNIX_TIMESTAMP(u.last_seen) AS last_seen,
                UNIX_TIMESTAMP()            AS server_now,
                j.label  AS job_label,
                g.label  AS grade_label
        FROM users u
        LEFT JOIN jobs        j ON j.name      = u.job
        LEFT JOIN job_grades  g ON g.job_name  = u.job AND g.grade = u.job_grade
        WHERE u.identifier = ? OR u.identifier LIKE ?
        ORDER BY u.identifier
    ]], { hex, 'char%:' .. hex })

    local characters = {}
    for _, row in ipairs(rows or {}) do
        local slot = tonumber(tostring(row.identifier):match('char(%d+):')) or 1

        local accounts = decodeJson(row.accounts) or {}

        local playtime = 0
        local meta = decodeJson(row.metadata)
        if meta and tonumber(meta.lastPlaytime) then
            playtime = math.floor(tonumber(meta.lastPlaytime))
        end

        characters[#characters + 1] = {
            slot        = slot,
            firstname   = row.firstname,
            lastname    = row.lastname,
            jobLabel    = row.job_label or row.job,
            gradeLabel  = row.grade_label,
            money       = accounts.money or 0,
            bank        = accounts.bank or 0,
            dateofbirth = row.dateofbirth,
            sex         = row.sex,
            playtime    = playtime,
            lastSeen    = row.last_seen,
            serverNow   = row.server_now,
        }
    end

    return characters
end

local function qbSex(gender)
    local g = tostring(gender or ''):lower()
    if g == '1' or g == 'f' or g == 'female' then return 'f' end
    if g == '0' or g == 'm' or g == 'male' then return 'm' end
    return nil
end

local function queryCharactersQb(src)
    local license = GetPlayerIdentifierByType(src, 'license')
    local license2 = GetPlayerIdentifierByType(src, 'license2')

    local rows = MySQL.query.await([[
        SELECT  charinfo, money, job,
                UNIX_TIMESTAMP(last_updated) AS last_seen,
                UNIX_TIMESTAMP()             AS server_now
        FROM players
        WHERE license IN (?, ?)
        ORDER BY citizenid
    ]], { license or '', license2 or '' })

    local characters = {}
    for i, row in ipairs(rows or {}) do
        local charinfo = decodeJson(row.charinfo) or {}
        local money = decodeJson(row.money) or {}
        local job = decodeJson(row.job) or {}

        characters[#characters + 1] = {
            slot        = tonumber(charinfo.cid) or i,
            firstname   = charinfo.firstname,
            lastname    = charinfo.lastname,
            jobLabel    = job.label or job.name,
            gradeLabel  = type(job.grade) == 'table' and job.grade.name or nil,
            money       = tonumber(money.cash) or 0,
            bank        = tonumber(money.bank) or 0,
            dateofbirth = charinfo.birthdate,
            sex         = qbSex(charinfo.gender),
            playtime    = 0,
            lastSeen    = row.last_seen,
            serverNow   = row.server_now,
        }
    end

    return characters
end

local function queryCharacters(src, license)
    local characters

    if getFramework() == 'qb' then
        characters = queryCharactersQb(src)
    elseif license then
        characters = queryCharactersEsx(license)
    end

    characters = characters or {}
    table.sort(characters, function(a, b) return a.slot < b.slot end)
    return characters
end

local function handover(deferrals, src, license)
    local characters = {}
    if charactersEnabled then
        local ok, res = pcall(queryCharacters, src, license)
        if ok and type(res) == 'table' then characters = res end
    end

    pcall(function()
        deferrals.handover({ lsCharacters = characters, lsStats = serverStats(), lsLocale = GetUiLocale() })
    end)
end

local attempts = {}

local function rateLimited(license, ip)
    if not (Config.RateLimit and Config.RateLimit.enabled) then return false end

    local cfg = Config.RateLimit
    local now = os.time()

    local keys = {}
    if cfg.byLicense and license then keys[#keys + 1] = 'lic:' .. license end
    if cfg.byIp and ip then keys[#keys + 1] = 'ip:' .. ip end

    local blockedFor = 0
    for _, key in ipairs(keys) do
        local a = attempts[key]
        if not a then a = { times = {} } attempts[key] = a end
        if a.blockedUntil and a.blockedUntil > now then
            blockedFor = math.max(blockedFor, a.blockedUntil - now)
        end
    end
    if blockedFor > 0 then return blockedFor end

    for _, key in ipairs(keys) do
        local a = attempts[key]
        local kept = {}
        for _, ts in ipairs(a.times) do
            if now - ts < cfg.windowSeconds then kept[#kept + 1] = ts end
        end
        kept[#kept + 1] = now
        a.times = kept

        if #kept > cfg.maxAttempts then
            a.blockedUntil = now + cfg.blockSeconds
            blockedFor = math.max(blockedFor, cfg.blockSeconds)
        end
    end

    return blockedFor > 0 and blockedFor or false
end

local function playerIdentifiers(src)
    local out = {}
    for _, id in ipairs(GetPlayerIdentifiers(src) or {}) do
        if not id:find('^ip:') then
            out[#out + 1] = id
        end
    end
    if #out == 0 then return nil end
    return '```\n' .. table.concat(out, '\n') .. '```'
end

local function webhookJoin(name, src)
    local url = webhookUrl('join')
    if not url then return end
    local ids = playerIdentifiers(src)
    postWebhook(url, {
        title = 'Player connected',
        color = 5763719,
        description = ('**%s** joined the server'):format(name or 'unknown'),
        fields = ids and { { name = 'Identifiers', value = ids } } or nil,
        footer = { text = os.date('%d.%m.%Y %H:%M:%S') },
    })
end

local function webhookLeave(name, src, reason)
    local url = webhookUrl('leave')
    if not url then return end
    local ids = playerIdentifiers(src)
    postWebhook(url, {
        title = 'Player disconnected',
        color = 15548997,
        description = ('**%s** left the server, reason: %s'):format(name or 'unknown', reason or 'unknown'),
        fields = ids and { { name = 'Identifiers', value = ids } } or nil,
        footer = { text = os.date('%d.%m.%Y %H:%M:%S') },
    })
end

AddEventHandler('playerConnecting', function(name, _, deferrals)
    local src = source
    deferrals.defer()
    Wait(0)

    local license = GetPlayerIdentifierByType(src, 'license')
    local ip = getEndpointIp(src)

    local blocked = rateLimited(license, ip)
    if blocked then
        deferrals.done(_U('connect.rateLimited', { n = blocked }))
        return
    end

    handover(deferrals, src, license)
    deferrals.done()

    webhookJoin(name, src)
end)

AddEventHandler('playerDropped', function(reason)
    webhookLeave(GetPlayerName(source), source, reason)
end)

CreateThread(function()
    while true do
        Wait(5000)
        local now = os.time()

        local window = (Config.RateLimit and Config.RateLimit.windowSeconds) or 30
        for key, a in pairs(attempts) do
            if not a.blockedUntil or a.blockedUntil <= now then
                local stale = true
                for _, ts in ipairs(a.times) do
                    if now - ts < window then
                        stale = false
                        break
                    end
                end
                if stale then attempts[key] = nil end
            end
        end
    end
end)
