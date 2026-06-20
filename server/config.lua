Config = Config or {}

-- Connect queue + throttle (shown on FiveM's native connect card, not the React UI).
Config.Queue = {
    -- false = no queue (classic defer -> handover -> done).
    enabled = true,

    -- Card language. nil = follow html/settings.json "locale". "en" | "de".
    locale = nil,

    -- How many players may load in at the same time. The rest wait in the queue.
    maxConcurrentConnecting = 1,

    -- Signal that frees a connect slot for the next player.
    --   "playerSpawned"    = client fully loaded and in the world (recommended).
    --   "esx:playerLoaded" = only after the multichar character pick (much later).
    slotFreeEvent = "playerSpawned",

    -- Fallback: free a slot anyway after this many seconds (stuck/abandoned load).
    joinGraceTime = 120,

    -- Queue position card refresh (ms).
    updateInterval = 1000,

    -- Slots kept free for reserved groups. Others use (sv_maxClients - reservedSlots). 0 = off.
    reservedSlots = 1,

    -- Priority for groups not listed below (non-reserved).
    defaultPriority = 0,

    -- ESX group (users.group): priority = served first, reserved = may use reserved slots.
    groups = {
        superadmin = { priority = 100, reserved = true },
        admin      = { priority = 90,  reserved = true },
        mod        = { priority = 50,  reserved = true },
        vip        = { priority = 20,  reserved = true },
        user       = { priority = 0 },
    },
}

-- Consent card shown before the queue (text in the queue.* locale keys).
Config.Consent = {
    -- false = skip the card.
    enabled = true,

    -- ToS version. Bump when rules/links change -> everyone must accept again.
    -- Players who already accepted this version skip the card.
    version = 1,

    -- Legal links as a clickable text line. Empty = hidden.
    links = {
        { label = "Terms of Service", url = "https://example.com/tos" },
        { label = "Privacy Policy",   url = "https://example.com/privacy" },
    },
}

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

-- Discord webhook for connect monitoring.
Config.Webhook = {
    enabled = false,
    url = "",
    username = "l-loadingscreen",

    -- Min seconds between "server full / queue" posts (anti spam).
    queueCooldown = 60,

    events = {
        full = true,     -- server full / a queue is forming
        join = true,     -- player got through and connected
        leave = true,    -- player disconnected
        consent = true,  -- player (re)accepted the ToS
    },
}
