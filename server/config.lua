Config = Config or {}

-- Framework the character query targets.
--   "auto" = detect at runtime (es_extended -> ESX, qb-core / qbx_core -> QBCore).
--   Set "esx" or "qb" to force it if the detection picks wrong.
Config.Framework = "auto"

-- Language of the loading screen and server-side connect messages: "en" or "de".
-- Locale files live in locales/ (en.lua / de.lua).
Config.Locale = "en"

-- Connect rate limit (anti spam / reconnect floods).
Config.RateLimit = {
    enabled = true,

    -- More than maxAttempts within windowSeconds -> blocked for blockSeconds.
    maxAttempts = 5,
    windowSeconds = 30,
    blockSeconds = 60,

    -- Which keys to count. byIp may affect players sharing one IP (same household).
    byLicense = true,
    byIp = true,
}

-- Discord webhooks for connect monitoring.
Config.Webhook = {
    enabled = false,
    username = "l-loadingscreen",

    -- One webhook URL per event. Empty "" = that event is off. Use the same URL on
    -- both events to send them to one channel.
    events = {
        join  = "",  -- player connected
        leave = "",  -- player disconnected
    },
}
