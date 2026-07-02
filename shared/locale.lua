local resolved

local function deepMerge(base, over)
    local out = {}
    for k, v in pairs(base) do out[k] = v end
    for k, v in pairs(over) do
        if type(v) == 'table' and type(out[k]) == 'table' then
            out[k] = deepMerge(out[k], v)
        else
            out[k] = v
        end
    end
    return out
end

local function resolve()
    if resolved then return resolved end

    local code = (Config and Config.Locale) or 'en'
    local en = Locales['en'] or {}
    local active = Locales[code] or en

    resolved = deepMerge(en, active)
    return resolved
end

function _U(key, vars)
    local cur = resolve()
    for part in key:gmatch('[^%.]+') do
        if type(cur) ~= 'table' then break end
        cur = cur[part]
    end

    local str = type(cur) == 'string' and cur or key
    if vars then
        str = str:gsub('{(%w+)}', function(name)
            local v = vars[name]
            return v ~= nil and tostring(v) or ('{' .. name .. '}')
        end)
    end

    return str
end

function GetUiLocale()
    return resolve()
end
