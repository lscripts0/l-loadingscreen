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

    -- Legal links as a clickable text line. Empty = hidden.
    links = {
        { label = "Terms of Service", url = "https://example.com/tos" },
        { label = "Privacy Policy",   url = "https://example.com/privacy" },
    },
}
