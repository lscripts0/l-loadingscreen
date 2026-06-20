local START_TIME = os.time()

local VERSION_REPO = 'lscripts0/l-loadingscreen'
local REPO_URL = 'https://github.com/lscripts0/l-loadingscreen'

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

local locale = {}

local function getValue(tbl, path)
    local cur = tbl
    for part in path:gmatch('[^%.]+') do
        if type(cur) ~= 'table' then return nil end
        cur = cur[part]
    end
    return cur
end

local function readLocaleFile(code)
    local raw = LoadResourceFile(GetCurrentResourceName(), ('html/locales/%s.json'):format(code))
    if not raw then return nil end
    local ok, data = pcall(json.decode, raw)
    if ok and type(data) == 'table' then return data end
    return nil
end

local function loadLocale()
    local code = Config.Queue and Config.Queue.locale

    if not code then
        local raw = LoadResourceFile(GetCurrentResourceName(), 'html/settings.json')
        if raw then
            local ok, data = pcall(json.decode, raw)
            if ok and type(data) == 'table' and type(data.locale) == 'string' then
                code = data.locale
            end
        end
    end

    code = code or 'en'
    locale = readLocaleFile(code) or readLocaleFile('en') or {}
end

local function t(key, vars)
    local str = getValue(locale, key)
    if type(str) ~= 'string' then str = key end

    if vars then
        str = str:gsub('{(%w+)}', function(name)
            local v = vars[name]
            return v ~= nil and tostring(v) or ('{' .. name .. '}')
        end)
    end

    return str
end

CreateThread(loadLocale)

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
            print(('^3Update available. Current: v%s, latest: v%s^0'):format(current, latest))
            print(('^3%s^0'):format(REPO_URL))
        else
            print(('^2Up to date (v%s)^0'):format(current))
        end
    end, 'GET', '', { ['User-Agent'] = 'l-loadingscreen' })
end

CreateThread(function()
    Wait(2000)
    checkVersion()
end)

CreateThread(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS l_loadingscreen_consent (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier  VARCHAR(60) NOT NULL,
            name        VARCHAR(64),
            ip          VARCHAR(45),
            version     INT NOT NULL,
            accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_identifier (identifier)
        )
    ]])
end)

local function getEndpointIp(src)
    local ep = GetPlayerEndpoint(src)
    if not ep then return nil end
    return (tostring(ep):gsub(':%d+$', ''))
end

local function postWebhook(embed)
    if not (Config.Webhook and Config.Webhook.enabled) then return end
    local url = Config.Webhook.url
    if not url or url == '' then return end

    PerformHttpRequest(url, function() end, 'POST', json.encode({
        username = Config.Webhook.username,
        embeds = { embed },
    }), { ['Content-Type'] = 'application/json' })
end

local function webhookEnabled(event)
    return Config.Webhook and Config.Webhook.enabled
        and Config.Webhook.events and Config.Webhook.events[event]
end

local function serverStats()
    return {
        players = #GetPlayers(),
        maxPlayers = GetConvarInt('sv_maxClients', 48),
        uptime = os.time() - START_TIME,
    }
end

local function queryCharacters(license)
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
        WHERE u.identifier LIKE ?
        ORDER BY u.identifier
    ]], { 'char%:' .. hex })

    local characters = {}
    for _, row in ipairs(rows or {}) do
        local slot = tonumber(tostring(row.identifier):match('char(%d+):')) or 0

        local accounts = {}
        if row.accounts then
            local ok, decoded = pcall(json.decode, row.accounts)
            if ok and type(decoded) == 'table' then accounts = decoded end
        end

        local playtime = 0
        if row.metadata then
            local ok, meta = pcall(json.decode, row.metadata)
            if ok and type(meta) == 'table' and tonumber(meta.lastPlaytime) then
                playtime = math.floor(tonumber(meta.lastPlaytime))
            end
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

    table.sort(characters, function(a, b) return a.slot < b.slot end)
    return characters
end

local queue = {}
local joining = {}
local seqCounter = 0

local function joiningCount()
    local n = 0
    for _ in pairs(joining) do n = n + 1 end
    return n
end

local function eligibleNow(entry)
    if joiningCount() >= Config.Queue.maxConcurrentConnecting then
        return false
    end

    local maxClients = GetConvarInt('sv_maxClients', 48)
    local free = maxClients - #GetPlayers() - joiningCount()

    if entry.reserved then
        return free > 0
    end

    return free - (Config.Queue.reservedSlots or 0) > 0
end

local function sortedQueue()
    local arr = {}
    for _, e in ipairs(queue) do arr[#arr + 1] = e end

    table.sort(arr, function(a, b)
        if a.priority ~= b.priority then return a.priority > b.priority end
        return a.seq < b.seq
    end)

    return arr
end

local function isMyTurn(entry)
    for _, e in ipairs(sortedQueue()) do
        if eligibleNow(e) then
            return e == entry
        end
    end
    return false
end

local function positionOf(entry)
    local arr = sortedQueue()
    for i, e in ipairs(arr) do
        if e == entry then return i, #arr end
    end
    return 0, #arr
end

local function removeFromQueue(entry)
    for i = #queue, 1, -1 do
        if queue[i] == entry then
            table.remove(queue, i)
            return
        end
    end
end

local function groupInfo(group)
    local g = group and Config.Queue.groups[group]
    if g then
        return g.priority or Config.Queue.defaultPriority, g.reserved == true
    end
    return Config.Queue.defaultPriority, false
end

local function queryGroup(license)
    local hex = license:gsub('license:', '')

    local rows = MySQL.query.await([[
        SELECT `group` AS grp FROM users WHERE identifier LIKE ?
    ]], { 'char%:' .. hex })

    local bestPriority, bestReserved, bestGroup = Config.Queue.defaultPriority, false, nil
    local found = false

    for _, row in ipairs(rows or {}) do
        local p, r = groupInfo(row.grp)
        if not found or p > bestPriority then
            bestPriority, bestReserved, bestGroup = p, r, row.grp
            found = true
        elseif p == bestPriority and r then
            bestReserved, bestGroup = true, row.grp
        end
    end

    return bestPriority, bestReserved, bestGroup
end

local function buildRulesCard()
    local body = {
        { type = 'TextBlock', text = t('queue.title'), weight = 'Bolder', size = 'Large', wrap = true },
        { type = 'TextBlock', text = t('queue.intro'), wrap = true, spacing = 'Small', isSubtle = true },
    }

    local links = Config.Consent.links or {}
    if #links > 0 then
        local parts = {}
        for _, link in ipairs(links) do
            if link.label and link.url then
                parts[#parts + 1] = ('[%s](%s)'):format(link.label, link.url)
            end
        end

        if #parts > 0 then
            body[#body + 1] = { type = 'TextBlock', text = table.concat(parts, '  •  '), wrap = true, spacing = 'Small' }
        end
    end

    return {
        ['$schema'] = 'http://adaptivecards.io/schemas/adaptive-card.json',
        type = 'AdaptiveCard',
        version = '1.3',
        body = body,
        actions = {
            { type = 'Action.Submit', title = t('queue.accept'), data = { action = 'accept' } },
            { type = 'Action.Submit', title = t('queue.deny'),   data = { action = 'deny' } },
        },
    }
end

local function awaitConsent(deferrals)
    local response
    local card = buildRulesCard()

    local function present()
        return pcall(function()
            deferrals.presentCard(card, function(data)
                if response ~= nil then return end
                local action = type(data) == 'table' and data.action or nil
                response = (action == 'accept') and 'accept' or 'deny'
            end)
        end)
    end

    Wait(700)
    if not present() then return true end

    local ticks = 0
    while response == nil do
        Wait(250)
        ticks = ticks + 1
        if ticks % 12 == 0 then present() end
    end

    return response == 'accept'
end

local function handover(deferrals, license)
    local characters = {}
    if charactersEnabled and license then
        local ok, res = pcall(queryCharacters, license)
        if ok and type(res) == 'table' then characters = res end
    end

    pcall(function()
        deferrals.handover({ lsCharacters = characters, lsStats = serverStats() })
    end)
end

local function consentVersionFor(license)
    if not license then return nil end
    local row = MySQL.single.await(
        'SELECT version FROM l_loadingscreen_consent WHERE identifier = ? ORDER BY id DESC LIMIT 1',
        { license }
    )
    return row and tonumber(row.version) or nil
end

local function recordConsent(license, name, ip, version)
    if not license then return end

    MySQL.insert(
        'INSERT INTO l_loadingscreen_consent (identifier, name, ip, version) VALUES (?, ?, ?, ?)',
        { license, name, ip, version }
    )

    if webhookEnabled('consent') then
        postWebhook({
            title = 'ToS accepted',
            color = 3447003,
            description = ('**%s**\n`%s`\nVersion %d'):format(name or 'unknown', license, version),
        })
    end
end

local function ensureConsent(deferrals, license, name, ip)
    if not (Config.Consent and Config.Consent.enabled) then return true end
    if consentVersionFor(license) == Config.Consent.version then return true end
    if not awaitConsent(deferrals) then return false end

    recordConsent(license, name, ip, Config.Consent.version)
    return true
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

local function webhookJoin(name, group)
    if not webhookEnabled('join') then return end
    postWebhook({
        title = 'Player connected',
        color = 5763719,
        description = ('**%s**%s\nOnline: %d / %d'):format(
            name or 'unknown',
            group and (' (' .. group .. ')') or '',
            #GetPlayers(), GetConvarInt('sv_maxClients', 48)
        ),
    })
end

local function webhookLeave(name)
    if not webhookEnabled('leave') then return end
    postWebhook({
        title = 'Player disconnected',
        color = 15548997,
        description = ('**%s**\nOnline: %d / %d'):format(
            name or 'unknown', #GetPlayers(), GetConvarInt('sv_maxClients', 48)
        ),
    })
end

local lastQueuePost = 0

local function maybeWebhookQueue(queueLen)
    if not webhookEnabled('full') then return end

    local now = os.time()
    local cooldown = (Config.Webhook and Config.Webhook.queueCooldown) or 60
    if now - lastQueuePost < cooldown then return end
    lastQueuePost = now

    postWebhook({
        title = 'Queue active',
        color = 15844367,
        description = ('Waiting: **%d**\nOnline: %d / %d'):format(
            queueLen, #GetPlayers(), GetConvarInt('sv_maxClients', 48)
        ),
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
        deferrals.done(t('queue.rateLimited', { n = blocked }))
        return
    end

    if not ensureConsent(deferrals, license, name, ip) then
        deferrals.done(t('queue.denied'))
        return
    end

    if not (Config.Queue and Config.Queue.enabled) then
        handover(deferrals, license)
        deferrals.done()
        return
    end

    local priority, reserved, group = Config.Queue.defaultPriority, false, nil
    if license then
        local ok, p, r, g = pcall(queryGroup, license)
        if ok then priority, reserved, group = p, r, g end
    end

    seqCounter = seqCounter + 1
    local entry = {
        src = src,
        key = license or ('src:' .. src),
        priority = priority,
        reserved = reserved,
        seq = seqCounter,
    }
    queue[#queue + 1] = entry

    while not isMyTurn(entry) do
        local pos, total = positionOf(entry)
        local maxClients = GetConvarInt('sv_maxClients', 48)
        local serverFull = (maxClients - #GetPlayers() - joiningCount()) <= 0
        local msg = serverFull and t('queue.full', { n = pos, total = total })
            or t('queue.position', { n = pos, total = total })

        maybeWebhookQueue(total)

        if not pcall(function() deferrals.update(msg) end) then
            removeFromQueue(entry)
            return
        end

        Wait(Config.Queue.updateInterval)
    end

    removeFromQueue(entry)
    joining[entry.key] = os.time()

    pcall(function() deferrals.update(t('queue.waiting')) end)

    handover(deferrals, license)
    deferrals.done()

    webhookJoin(name, group)
end)

local function freeSlot(playerId)
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if license then joining[license] = nil end
    joining['src:' .. playerId] = nil
end

local function slotFreeEvent()
    return (Config.Queue and Config.Queue.slotFreeEvent) or 'playerSpawned'
end

AddEventHandler('esx:playerLoaded', function(playerId)
    if slotFreeEvent() == 'esx:playerLoaded' then freeSlot(playerId) end
end)

RegisterNetEvent('l-loadingscreen:playerSpawned', function()
    if slotFreeEvent() == 'playerSpawned' then freeSlot(source) end
end)

AddEventHandler('playerDropped', function()
    local src = source
    webhookLeave(GetPlayerName(src))
    freeSlot(src)

    for i = #queue, 1, -1 do
        if queue[i].src == src then table.remove(queue, i) end
    end
end)

CreateThread(function()
    while true do
        Wait(5000)
        local now = os.time()

        local grace = (Config.Queue and Config.Queue.joinGraceTime) or 120
        for s, since in pairs(joining) do
            if now - since > grace then joining[s] = nil end
        end

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
