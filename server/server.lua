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

AddEventHandler('playerConnecting', function(_, _, deferrals)
    local src = source
    deferrals.defer()
    Wait(0)

    local characters = {}
    if charactersEnabled then
        local license = GetPlayerIdentifierByType(src, 'license')
        if license then
            local ok, res = pcall(queryCharacters, license)
            if ok and type(res) == 'table' then characters = res end
        end
    end

    pcall(function()
        deferrals.handover({ lsCharacters = characters, lsStats = serverStats() })
    end)

    deferrals.done()
end)
